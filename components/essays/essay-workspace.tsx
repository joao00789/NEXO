"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Camera, Check, Clock3, FileText, ImagePlus, Save, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveEssayAction, saveEssayCorrectionAction } from "@/lib/essays/actions";
import type { EssayCorrection, EssayTheme } from "@/lib/essays/schemas";

export type EssayDraft = { id: string; theme_id: string | null; theme_title: string; body: string; updated_at: string; correction: EssayCorrection | null };

const competencyNames = ["Domínio da norma-padrão", "Compreensão do tema", "Seleção e organização dos argumentos", "Coesão e mecanismos linguísticos", "Proposta de intervenção"];

export function EssayWorkspace({ themes, drafts }: { themes: EssayTheme[]; drafts: EssayDraft[] }) {
  const [activeTheme, setActiveTheme] = useState<EssayTheme | null>(themes[0] ?? null);
  const [essayId, setEssayId] = useState<string | undefined>();
  const [body, setBody] = useState("");
  const [correction, setCorrection] = useState<EssayCorrection | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, startSave] = useTransition();
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => body.trim() ? body.trim().split(/\s+/).length : 0, [body]);
  const activeThemeId = activeTheme?.id && !activeTheme.id.startsWith("generated-") ? activeTheme.id : undefined;

  function openDraft(draft: EssayDraft) {
    setEssayId(draft.id);
    setBody(draft.body);
    setCorrection(draft.correction);
    setActiveTheme({ id: draft.theme_id ?? "", title: draft.theme_title, category: "social", motivation: "Tema do seu histórico de redações." });
    setNotice("Rascunho carregado.");
  }

  function saveDraft() {
    if (!activeTheme) return;
    setNotice("");
    startSave(async () => {
      const result = await saveEssayAction({ id: essayId, themeId: activeThemeId, themeTitle: activeTheme.title, body });
      if (result.error) { setNotice(result.error); return; }
      setEssayId(result.id);
      setNotice("Rascunho salvo.");
    });
  }

  async function requestAi(task: "correct" | "theme") {
    setBusy(true);
    setNotice("");
    try {
      const form = new FormData();
      form.set("task", task === "theme" ? "theme" : "correct");
      if (task === "correct") {
        if (!activeTheme) throw new Error("Escolha um tema primeiro.");
        form.set("theme", activeTheme.title);
        form.set("essay", body);
        if (image) form.set("image", image);
      }
      const response = await fetch("/api/essays/ai", { method: "POST", body: form });
      const data = await response.json() as { correction?: EssayCorrection; theme?: EssayTheme; error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao falar com a IA.");
      if (data.correction) {
        setCorrection(data.correction);
        const active = activeTheme;
        if (active) {
          const saved = await saveEssayAction({ id: essayId, themeId: activeThemeId, themeTitle: active.title, body });
          if (saved.error) throw new Error(saved.error);
          if (saved.id) {
            setEssayId(saved.id);
            const stored = await saveEssayCorrectionAction(saved.id, data.correction);
            if (stored.error) setNotice(stored.error);
          }
        }
        setNotice("Correção estimada pronta. Use os comentários como orientação de estudo.");
      }
      if (data.theme) {
        setActiveTheme({ ...data.theme, id: `generated-${Date.now()}` });
        setEssayId(undefined);
        setBody("");
        setCorrection(null);
        setNotice("Tema autoral gerado pela IA; ele não é um tema oficial do ENEM.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível concluir a solicitação.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div><CardTitle>Seu tema</CardTitle><CardDescription className="mt-1">Treine uma dissertação argumentativa com recorte social.</CardDescription></div>
            <Button type="button" variant="outline" disabled={busy} onClick={() => void requestAi("theme")}><WandSparkles /> Gerar tema</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <select aria-label="Escolher tema de redação" className="bg-background border-input min-h-10 w-full rounded-lg border px-3 text-sm" value={activeTheme?.id ?? ""} onChange={(event) => {
              const selected = themes.find((theme) => theme.id === event.target.value);
              if (selected) { setActiveTheme(selected); setEssayId(undefined); setBody(""); setCorrection(null); }
            }}>
              {activeTheme && !themes.some((theme) => theme.id === activeTheme.id) ? <option value={activeTheme.id}>{activeTheme.title}</option> : null}
              {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.is_official ? `${theme.source_label ?? "Tema oficial"} — ` : ""}{theme.title}</option>)}
            </select>
            <p className="text-muted-foreground text-sm">{activeTheme?.motivation}</p>
            {activeTheme?.source_url ? <a href={activeTheme.source_url} target="_blank" rel="noreferrer" className="text-primary w-fit text-xs underline">Fonte: {activeTheme.source_label ?? "INEP"}</a> : activeTheme?.is_official ? <span className="text-muted-foreground text-xs">Tema oficial do ENEM</span> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="size-4 text-primary" /> Editor de redação</CardTitle>
            <CardDescription>Rascunhos salvam para você continuar depois. A imagem é enviada temporariamente para leitura pela IA.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea aria-label="Texto da redação" value={body} onChange={(event) => setBody(event.target.value.slice(0, 12000))} placeholder="Comece sua redação aqui…" className="min-h-[22rem] resize-y bg-background leading-7" />
            <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs"><span>{words} palavras · {body.length}/12.000 caracteres</span><span>Referência de treino: 20 a 30 linhas</span></div>
            <input ref={fileRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} aria-label="Selecionar foto da redação manuscrita" />
            {image ? <p className="text-muted-foreground text-xs" role="status">Imagem selecionada: {image.name} ({(image.size / 1024 / 1024).toFixed(1)} MB)</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}><ImagePlus /> Enviar foto</Button>
              <Button type="button" variant="secondary" disabled={saving} onClick={saveDraft}><Save /> {saving ? "Salvando…" : "Salvar rascunho"}</Button>
              <Button type="button" disabled={busy || (!body.trim() && !image)} onClick={() => void requestAi("correct")}><Sparkles /> {busy ? "Analisando…" : "Corrigir com IA"}</Button>
            </div>
            {notice ? <p role="status" className="text-muted-foreground text-sm">{notice}</p> : null}
          </CardContent>
        </Card>

        {correction ? <Card>
          <CardHeader><CardTitle className="flex flex-wrap items-center justify-between gap-2">Correção estimada <span className="text-primary text-2xl">{correction.score}/1000</span></CardTitle><CardDescription>Estimativa educacional; não representa uma nota oficial do ENEM.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {correction.competencies.map((item) => <div key={item.number} className="border-border border-b pb-3 last:border-0"><div className="flex justify-between gap-3 text-sm font-medium"><span>Competência {item.number} · {competencyNames[item.number - 1]}</span><span>{item.score}/200</span></div><p className="text-muted-foreground mt-1 text-sm">{item.feedback}</p></div>)}
            <div className="grid gap-4 sm:grid-cols-2"><div><h3 className="mb-2 text-sm font-medium">Pontos fortes</h3><ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">{correction.strengths.map((line) => <li key={line}>{line}</li>)}</ul></div><div><h3 className="mb-2 text-sm font-medium">Para revisar</h3><ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">{[...correction.improvements, ...correction.grammar_notes].slice(0, 8).map((line) => <li key={line}>{line}</li>)}</ul></div></div>
          </CardContent>
        </Card> : null}
      </section>

      <aside className="flex flex-col gap-4">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock3 className="size-4" /> Redações anteriores</CardTitle><CardDescription>Retome um rascunho e veja os temas que já treinou.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2">
          {drafts.length ? drafts.map((draft) => <button key={draft.id} type="button" onClick={() => openDraft(draft)} className="border-border hover:bg-muted rounded-lg border p-3 text-left focus-visible:ring-2 focus-visible:ring-ring"><span className="block line-clamp-2 text-sm font-medium">{draft.theme_title}</span><span className="text-muted-foreground mt-1 flex items-center gap-1 text-xs"><Check className="size-3" /> {draft.correction ? `Nota estimada ${draft.correction.score}` : "Rascunho"} · {new Date(draft.updated_at).toLocaleDateString("pt-BR")}</span></button>) : <p className="text-muted-foreground text-sm">Suas redações salvas aparecerão aqui.</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Camera className="size-4" /> Correção por foto</CardTitle><CardDescription>Use uma foto nítida da folha, bem iluminada e sem cortes.</CardDescription></CardHeader><CardContent className="text-muted-foreground text-xs">JPEG, PNG ou WebP de até 4 MB. A imagem é processada pela IA e não fica guardada no NEXO. {image ? <span className="text-foreground mt-2 block">Arquivo pronto para enviar.</span> : null}</CardContent></Card>
      </aside>
    </div>
  );
}
