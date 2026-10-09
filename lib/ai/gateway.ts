import "server-only";

export class ProviderError extends Error {
  readonly status: number;

  constructor(provider: string, status: number) {
    super(`${provider} respondeu ${status}`);
    this.name = "ProviderError";
    this.status = status;
  }
}

function groqModels() {
  const configured = (process.env.GROQ_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  const primary = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  return [...new Set([primary, ...configured, "openai/gpt-oss-120b", "llama-3.3-70b-versatile"])];
}

async function gemini(systemPrompt: string, prompt: string, options: Required<Pick<GenerateJsonOptions, "maxOutputTokens" | "timeoutMs">> & GenerateJsonOptions) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY ausente");
  const parts = [{ text: prompt }];
  if (options.image) parts.push({ inline_data: { mime_type: options.image.mimeType, data: options.image.data } } as never);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-3.8-flash"}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: options.maxOutputTokens,
        temperature: options.temperature,
        thinkingConfig: { thinkingLevel: options.thinkingLevel },
      },
    }),
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  if (!response.ok) throw new Error(`Gemini respondeu ${response.status}`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!content) throw new Error("Resposta vazia do Gemini");
  return content;
}

async function compatibleChat(provider: "groq" | "openrouter", systemPrompt: string, prompt: string, options: Required<Pick<GenerateJsonOptions, "maxOutputTokens" | "timeoutMs">> & GenerateJsonOptions, modelOverride?: string) {
  const groq = provider === "groq";
  const key = groq ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error(`${provider} indisponível`);
  const response = await fetch(groq ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: modelOverride || (groq ? (process.env.GROQ_MODEL || "openai/gpt-oss-20b") : (process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b")),
      messages: [
        { role: "system", content: `${systemPrompt} Retorne apenas JSON válido.` },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: options.temperature,
      max_tokens: options.maxOutputTokens,
    }),
    signal: AbortSignal.timeout(options.timeoutMs),
  });
  if (!response.ok) throw new ProviderError(provider, response.status);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Resposta vazia do ${provider}`);
  return content;
}

export type GenerateJsonOptions = {
  image?: { mimeType: string; data: string };
  thinkingLevel?: "medium" | "high";
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

/**
 * Chama os provedores de IA em cascata e devolve a resposta validada como
 * objeto. Todo consumo de IA passa por esta central para evitar chamadas
 * diretas dos componentes e permitir troca de provedor sem tocar no frontend.
 */
export async function generateJson(
  systemPrompt: string,
  prompt: string,
  options: GenerateJsonOptions = {},
): Promise<unknown> {
  const normalized: GenerateJsonOptions = {
    thinkingLevel: options.thinkingLevel ?? "medium",
    maxOutputTokens: options.maxOutputTokens ?? 5000,
    temperature: options.temperature ?? 0,
    timeoutMs: options.timeoutMs ?? 45000,
    ...options,
  };
  const required = normalized as Required<Pick<GenerateJsonOptions, "maxOutputTokens" | "timeoutMs">> & GenerateJsonOptions;

  const preferred = process.env.AI_PROVIDER || "gemini";
  const providers = normalized.image ? ["gemini"] : [preferred, process.env.AI_FALLBACK_PROVIDER || "groq", "openrouter"];
  let lastError: unknown;
  for (const provider of [...new Set(providers)]) {
    try {
      if (provider === "groq") {
        let groqError: unknown;
        for (const model of groqModels()) {
          try {
            const raw = await compatibleChat("groq", systemPrompt, prompt, required, model);
            return JSON.parse(raw) as unknown;
          } catch (error) {
            groqError = error;
            lastError = error;
            // Credenciais/permissões inválidas afetam a conta inteira; outros erros
            // podem ser específicos do modelo, como limite, indisponibilidade ou ID removido.
            if (!(error instanceof ProviderError) || [401, 403].includes(error.status)) break;
          }
        }
        if (groqError) throw groqError;
      }
      const raw = provider === "gemini"
        ? await gemini(systemPrompt, prompt, required)
        : await compatibleChat("openrouter", systemPrompt, prompt, required);
      return JSON.parse(raw) as unknown;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Provedores de IA indisponíveis");
}