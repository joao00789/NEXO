import { requireUserSession } from "@/lib/auth/session";
import { correctEssay, generateEssayTheme } from "@/lib/ai/essay-gateway";
import { essayCorrectionInputSchema } from "@/lib/essays/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireUserSession();
    const supabase = await createSupabaseServerClient();
    const form = await request.formData();
    const task = form.get("task");
    if (task === "theme") {
      const { data: allowed, error } = await supabase.rpc("consume_essay_ai_quota", { p_task: "theme" });
      if (error) return Response.json({ error: "Não foi possível verificar o limite de uso da IA." }, { status: 503 });
      if (!allowed) return Response.json({ error: "Você atingiu o limite diário de temas gerados. Tente amanhã." }, { status: 429 });
      return Response.json({ theme: await generateEssayTheme() });
    }
    const parsed = essayCorrectionInputSchema.safeParse({
      essay: form.get("essay"),
      theme: form.get("theme"),
    });
    if (!parsed.success) return Response.json({ error: "Escreva ao menos 100 caracteres e selecione um tema." }, { status: 400 });

    const imageFile = form.get("image");
    let image: { mimeType: string; data: string } | undefined;
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > 4 * 1024 * 1024) return Response.json({ error: "A imagem deve ter no máximo 4 MB." }, { status: 413 });
      if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(imageFile.type)) {
        return Response.json({ error: "Envie uma imagem JPEG, PNG ou WebP." }, { status: 415 });
      }
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const validMagic = imageFile.type === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8
        : imageFile.type === "image/png" ? bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
          : bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
      if (!validMagic) return Response.json({ error: "O arquivo não corresponde a uma imagem válida." }, { status: 415 });
      const data = Buffer.from(bytes).toString("base64");
      image = { mimeType: imageFile.type, data };
    }
    if (parsed.data.essay.length < 100 && !image) return Response.json({ error: "Escreva ao menos 100 caracteres ou envie uma foto legível da redação." }, { status: 400 });
    if (parsed.data.essay.length < 100 && image) {
      parsed.data.essay = "[A redação manuscrita está na imagem anexada. Transcreva-a mentalmente antes de avaliar; se não estiver legível, informe isso nos feedbacks.]";
    }
    const { data: allowed, error } = await supabase.rpc("consume_essay_ai_quota", { p_task: "correction" });
    if (error) return Response.json({ error: "Não foi possível verificar o limite de uso da IA." }, { status: 503 });
    if (!allowed) return Response.json({ error: "Você atingiu o limite diário de correções. Tente novamente amanhã." }, { status: 429 });
    const correction = await correctEssay(parsed.data.theme, parsed.data.essay, image);
    return Response.json({ correction });
  } catch (error) {
    console.error("Essay AI request failed", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "Não foi possível corrigir agora. Verifique a configuração da IA e tente novamente." }, { status: 503 });
  }
}
