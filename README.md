# NEXO

Plataforma gratuita e gamificada de preparação para o ENEM, com IA para
personalização do estudo.

Especificação mestre do produto: [`PROMPT.txt`](./PROMPT.txt).
Regras permanentes para agentes de IA: [`AGENTS.md`](./AGENTS.md).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Framer Motion, Lucide React, Recharts, @xyflow/react
- Supabase (Auth, PostgreSQL, Storage, RLS)
- AI Gateway com provedores Gemini / Groq / OpenRouter (com fallback)

## Requisitos

- Node.js 20+
- npm 9+
- Um projeto Supabase (opcional no início — a UI funciona sem credenciais)

## Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de ambiente a partir do exemplo
cp .env.example .env.local

# 3. Preencher .env.local com as chaves do seu projeto Supabase
#    (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#     SUPABASE_SERVICE_ROLE_KEY)

# 4. Subir em desenvolvimento
npm run dev
```

Acesse <http://localhost:3000>.

## Scripts

| Comando              | Descrição                    |
| -------------------- | ---------------------------- |
| `npm run dev`        | Servidor de desenvolvimento  |
| `npm run build`      | Build de produção            |
| `npm run start`      | Servir o build de produção   |
| `npm run lint`       | ESLint                       |
| `npm run typecheck`  | TypeScript sem emitir arquivos |
| `npm run format`     | Prettier (formatar o repo)   |

## Estrutura

```
app/
  (marketing)/    # rotas públicas: /, /sobre, /como-funciona
  (auth)/         # /login, /cadastro, /recuperar-senha
  app/            # área autenticada: /app/...
  admin/          # painel administrativo: /admin/...
  api/            # route handlers (ai, questions, essays, ...)
components/       # ui/ (shadcn), layout/, dashboard/, questions/, ...
lib/
  supabase/       # clientes browser/server/admin
  ai/             # AI Gateway (futuro)
  auth/ db/ scoring/ gamification/ recommendations/ validation/ security/
public/
  brand/          # logo e variações
  icons/ avatar/ images/
supabase/
  migrations/     # migrations do banco
  config.toml seed.sql
tests/            # unit/ integration/ e2e/
docs/
```

## Variáveis de ambiente

Ver [`.env.example`](./.env.example). Nunca coloque chaves reais no
frontend — tudo que é sensível passa pelo servidor.

## Roadmap (resumo)

O MVP cobre cadastro/login, dashboard, questões, correção, desempenho,
conteúdo, redação, mapa mental, XP, missões e avatar básico. Simulados
completos, loja, Coins, eventos, pagamentos e admin avançado vêm depois.

O detalhamento de fases está na seção 41 do `PROMPT.txt`.
