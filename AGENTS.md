# AGENTS.md — Regras permanentes do NEXO

NEXO: plataforma gratuita e gamificada de preparação para o ENEM.
Especificação mestre: `PROMPT.txt` (ler antes de grandes mudanças).

## Arquitetura

- Next.js (App Router) + TypeScript estrito + Tailwind CSS + shadcn/ui
- Framer Motion (animações), Lucide React (ícones), Recharts (gráficos), @xyflow/react (mapas mentais)
- Supabase: Auth, PostgreSQL, Storage, RLS — backend principal
- AI Gateway em `lib/ai/` com fallback de provedor (Gemini → Groq → OpenRouter)
- Rotas públicas em `app/(marketing)` e `app/(auth)`; app autenticado em `app/app`; admin em `app/admin`

## Regras

1. Leia a arquitetura antes de alterar código.
2. Não reescreva componentes existentes sem necessidade.
3. Não crie dependências desnecessárias.
4. Use TypeScript estrito.
5. Use componentes reutilizáveis.
6. Não colocar segredo/API key no frontend.
7. Toda operação sensível deve passar pelo servidor.
8. Respeitar RLS do Supabase.
9. Validar entradas com Zod.
10. Criar testes para lógica importante.
11. Rodar lint após mudanças.
12. Rodar testes relevantes.
13. Não quebrar funcionalidades existentes.
14. Não inventar tabelas do banco.
15. Alterações de banco devem ser migrations.
16. Não modificar design system sem motivo.
17. Usar os tokens de design existentes.
18. Preferir SVG.
19. Respeitar acessibilidade (contraste, foco, aria, nunca só cor como indicador).
20. Respeitar prefers-reduced-motion.
21. Não usar cores fora do design system sem justificativa.
22. Não colocar monetização fora da loja de avatar.
23. Não vender conteúdo educacional.
24. Não chamar APIs de IA diretamente pelo browser.
25. Não apresentar conteúdo gerado pela IA como oficial.
26. Antes de terminar uma tarefa, verificar build/lint/testes.

## Design system (tokens em `app/globals.css`)

- Background `#0A0A0B`, Surface `#111214`, Card `#17181B`, Border `#282A2E`
- Texto principal `#F5F5F5`, texto secundário `#9A9CA3`
- Azul de destaque `#2E6BFF` — cor de ação/destaque, não pintar a UI inteira de azul
- Fontes: Inter (principal), Manrope (display/títulos) — pesos 400/500/600/700
- Tema padrão: dark. Logo e assets em `public/brand/`

## Fluxo de trabalho

PLANEJAR → IMPLEMENTAR → TESTAR → REVISAR → CORRIGIR → ENTREGAR.

Tarefas pequenas e verificáveis. Nunca "prompt grande → 500 arquivos → pronto".

## Comandos

- `npm run dev` — desenvolvimento
- `npm run lint` — lint
- `npx tsc --noEmit` — typecheck
- `npm run build` — build

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
