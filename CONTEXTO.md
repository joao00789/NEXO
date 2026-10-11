# Contexto do projeto NEXO

Este documento dá contexto rápido para pessoas e IAs que forem trabalhar no
repositório. Ele resume o produto, a arquitetura, o que já foi implementado e
as decisões que não devem ser perdidas. Para começar uma tarefa, leia também
[`AGENTS.md`](./AGENTS.md) e a especificação mestre [`PROMPT.txt`](./PROMPT.txt).

> O código é a fonte da verdade sobre o que está implementado. O `PROMPT.txt`
> define a visão do produto e pode incluir funcionalidades planejadas que ainda
> não existem. Antes de afirmar que algo funciona, confira a implementação e o
> estado do Supabase/deploy.

## 1. O que é o NEXO

NEXO é uma plataforma gratuita, em português do Brasil, de preparação para o
ENEM. O estudante deve poder aprender, praticar, acompanhar seu desempenho e
escolher o próximo passo em um só lugar. A gamificação incentiva os estudos,
mas não deve vender vantagens educacionais.

Princípios do produto:

- Questões, conteúdos, redação, mapas mentais, simulados e desempenho devem
  continuar gratuitos.
- A personalização cosmética pode usar NEXO Coins (por exemplo, temas visuais
  e itens de avatar); não monetizar conteúdo educacional.
- A plataforma deve ser moderna, confiável, acessível e adequada a sessões
  longas de estudo — sem parecer infantil ou excessivamente gamer.
- Texto de interface em português brasileiro, claro e direto.

## 2. Stack e arquitetura

- Next.js App Router **16.4.0**, React **19.3.0** e TypeScript estrito.
- Tailwind CSS v4, componentes no padrão shadcn/ui/Base UI, Lucide React e
  Framer Motion; Recharts e `@xyflow/react` em funcionalidades específicas.
- Supabase Auth e PostgreSQL são o backend principal. Dados de usuário devem
  respeitar RLS.
- Server Components carregam dados; Server Actions tratam alterações e
  formulários; operações de banco que precisam de atomicidade ficam em funções
  RPC/migrations SQL.
- Toda chamada de IA passa pelo gateway de servidor em `lib/ai/`. Não chamar
  provedores diretamente do browser.
- Segredos ficam apenas no servidor. Nunca expor `SUPABASE_SERVICE_ROLE_KEY`
  ou chaves de IA ao frontend.

Estrutura importante:

```text
app/
  (marketing)/       páginas públicas de marketing
  (auth)/            login, cadastro e recuperação de senha
  app/               área autenticada do estudante
  admin/             área administrativa
  auth/              callbacks e início de OAuth
  api/               endpoints de servidor
components/          interface, agrupada por funcionalidade
lib/                 autenticação, Supabase, IA, regras e validação
supabase/migrations/ alterações ordenadas do banco
tests/unit/          testes unitários com node:test/tsx
public/brand/        logos e ativos de marca
```

Clientes Supabase:

- `lib/supabase/server.ts`: cliente associado aos cookies/sessão da requisição.
- `lib/supabase/client.ts`: cliente de browser para usos apropriados.
- `lib/supabase/admin.ts`: cliente administrativo com service role, somente
  servidor; usado, por exemplo, para exclusão de conta.
- `lib/auth/session.ts`: `requireUserSession()` protege rotas e ações.

## 3. Rotas e funcionalidades implementadas

### Públicas e autenticação

- `/`, `/sobre` e `/como-funciona`: páginas de marketing.
- `/login`, `/cadastro` e `/recuperar-senha`: acesso, cadastro e envio de
  recuperação de senha.
- Google OAuth usa `/auth/google` e `/auth/callback`; o callback limita o
  destino a caminhos internos.
- `/app/configuracoes`: alteração do nome, dados básicos, definição de nova
  senha e exclusão irreversível da conta. A exclusão exige digitar `EXCLUIR`.
- `app/layout.tsx` define metadata do site, Open Graph/Twitter Card e a URL
  base pública `https://nexo-pearl-pi.vercel.app`. `app/icon.svg` e
  `app/opengraph-image.tsx` fornecem ícone e imagem de compartilhamento.

### Área de estudante

- `/app`: dashboard com perfil, nível, XP, moedas, atividade e progresso.
- `/app/questoes`: prática de questões cadastradas e questões de IA.
- `/app/conteudos`: biblioteca autoral de estudo para áreas do ENEM, referências
  complementares e criação de material/exercícios por IA.
- `/app/redacao`: temas, rascunhos e fluxo de correção assistida por IA.
- `/app/mapas` e `/app/mapas/[id]`: mapas mentais, templates e canvas.
- `/app/simulados`: sessão de simulado com submissão de respostas.
- `/app/desempenho`: histórico de tentativas e desempenho por área.
- `/app/missoes`: missões e ranking.
- `/app/avatar`: avatar e cosméticos.
- `/app/loja`: catálogo/equipamento de temas visuais comprados com moedas.
- `/app/batalhas`: batalhas gamificadas.

### Administração

Existem páginas em `/admin` para overview, usuários, questões, conteúdos,
redações, temas, loja, itens, missões, analytics, IA e moderação. Ao alterar
admin, verificar as proteções de autorização e RLS existentes; não presumir que
a existência da página implica autorização correta.

## 4. Aprendizado e inteligência artificial

- `lib/ai/gateway.ts` centraliza geração JSON. O provedor preferido é definido
  por `AI_PROVIDER`; há fallback configurável e tentativa de provedores
  alternativos. Com imagem, o gateway usa Gemini.
- Provedores e modelos configuráveis: Gemini, Groq e OpenRouter. Ver nomes de
  variáveis em `.env.example`; jamais copie valores reais para documentação.
- Saídas da IA devem ser validadas com Zod antes de persistir ou apresentar.
- `lib/content/`, `lib/questions/`, `lib/essays/` e `lib/mindmaps/` contêm
  schemas e ações específicos.
- O conteúdo é recurso autoral do NEXO; a IA não deve ser apresentada como
  fonte oficial. Referências externas devem ser identificadas como
  complementares.
- Questões de IA são geradas sob demanda. Tentativas ficam em
  `ai_question_attempts`; não se persiste a questão completa como se fosse
  parte do banco oficial de questões.
- A prática por IA afeta desempenho e missões, assim como tentativas das
  questões cadastradas.

## 5. Dados, segurança e migrations

O banco inclui, entre outras, entidades de perfil (`profiles`), progresso,
questões/opções/tentativas, tentativas de questões IA, mapas mentais, redações,
missões, transações de moedas, inventário cosmético e temas do site.

Regras:

- Mudança de schema, função RPC, trigger, policy, seeds ou catálogo armazenado
  no banco deve ser uma nova migration SQL em `supabase/migrations/`. Não altere
  uma migration que já possa ter sido aplicada em produção.
- Aplicar localmente ou em produção são etapas distintas. Subir migration para o
  Git/Vercel não executa SQL no Supabase. Confirmar sempre com o usuário se uma
  migration pendente foi aplicada, em especial em produção.
- Não inventar tabelas ou colunas: conferir migrations e schema reais primeiro.
- RLS deve continuar habilitado. RPCs com `SECURITY DEFINER` devem restringir
  permissões, validar usuário/entrada e definir `search_path` seguro.
- Operações com saldo, XP ou recompensas não devem ser confiadas ao cliente.
- Erros de integração devem ser registrados e exibidos sem respostas que
  finjam sucesso.

Migrations presentes no repositório, em ordem aproximada:

1. `20261007_create_auth_foundation.sql`: tabelas básicas de perfil/progresso,
   RLS e trigger `updated_at`.
2. `20261007120000_create_question_practice.sql`: questões, alternativas,
   tentativas, progresso e submissão segura.
3. `20261007130000_create_profile_on_signup.sql`: criação/normalização de
   perfil após cadastro.
4. `20261008100000_create_mind_maps.sql`: mapas mentais.
5. `20261008120000_create_avatar_shop.sql`: cosméticos, inventário, ledger de
   moedas e recompensas.
6. `20261008140000_missions_essays_animals.sql`: missões, redações, animais e
   funções associadas.
7. `20261008150000_activate_cube_pets.sql`: atualização do catálogo de animais.
8. `20261009100000_seed_core_question_bank.sql`: banco inicial de questões.
9. `20261009120000_extend_essay_ai_usage.sql`: limites/uso de IA para redação.
10. `20261009130000_expand_essay_themes.sql`: temas adicionais de redação.
11. `20261009140000_expand_authored_question_bank.sql`: expansão de questões
    autorais.
12. `20261009150000_add_simulation_submission.sql`: submissão de simulados.
13. `20261009160000_fix_practice_attempt_topic.sql`,
    `20261009170000_fix_practice_attempt_difficulty.sql` e
    `20261009180000_map_attempt_difficulty_values.sql`: correções de dados da
    prática.
14. `20261010142000_replace_avatar_shop_with_site_themes.sql`: início da loja
    de temas do site.
15. `20261010153000_add_animated_site_themes.sql`: temas animados adicionais.
16. `20261010170000_add_ai_generated_question_attempts.sql`: tentativas de
    questões de IA, progresso, XP, moedas e integração com missões.
17. `20261010181000_add_dark_site_themes.sql`: temas escuros Obsidiana,
    Floresta noturna, Ametista e Carmesim.
18. `20261010190000_add_xp_level_progression.sql`: trigger que sincroniza nível
    com XP acumulado, 100 XP por nível.
19. `20261010200000_add_black_animated_themes.sql`: temas de base preta listados
    na seção de temas abaixo.

Este inventário descreve os arquivos versionados, não comprova o estado atual
de execução no projeto Supabase. Pedir/confirmar status quando necessário.

## 6. Gamificação e XP

- O XP é persistido em `profiles.xp`; o nível correspondente é
  `floor(xp / 100) + 1`, implementado em SQL por
  `20261010190000_add_xp_level_progression.sql`.
- A cada 100 XP, o perfil avança um nível. Exemplo: 195 XP = nível 2, faltam
  5 XP para o nível 3.
- `lib/gamification/levels.ts` calcula nível, avanço e XP restante para a UI.
- O dashboard exibe o nível e a barra de progresso até o próximo nível.
- Questões geradas por IA atualmente concedem 5 XP por tentativa; regras de
  moedas e missões também são definidas no banco.
- Manter consistência entre a regra SQL, cálculos TypeScript e UI. Testar
  limites em 99/100/199/200 XP.

## 7. Temas visuais

Os temas são cosméticos da loja. `lib/themes/catalog.ts` é a lista permitida
usada por tipos/schemas/ações; `app/globals.css` define tokens, paletas e
animações; as migrations mantêm o catálogo permitido no banco. Ao adicionar
tema, atualizar os três lados (e testes).

Temas definidos atualmente:

- Originais/animados: Aurora, Nebulosa, Amanhecer, Oceano profundo, Jardim
  Sakura, Cyber grid, Vulcão e Cristal.
- Adicionados como temas escuros: Obsidiana, Floresta noturna, Ametista e
  Carmesim.
- Adicionados com base preta: Black, Black Neon, Black Emerald e Black Rose.

Os quatro temas de base preta têm efeitos distintos: reflexo prateado,
grade ciano, pontos de luz verdes e pétalas rosas. O tema equipado é passado
pelo `AppShell` para também colorir o menu lateral móvel. A animação global deve
respeitar `prefers-reduced-motion`.

Para novos temas:

1. Acrescentar o ID e cores de preview em `lib/themes/catalog.ts`.
2. Definir todos os tokens CSS em `app/globals.css` e o efeito de fundo distinto.
3. Adicionar a ID ao constraint e ao catálogo em uma nova migration.
4. Atualizar testes de schemas e verificar loja, menu desktop/móvel, logo e
   tema equipado.
5. Confirmar aplicação da migration para que o tema apareça na loja.

## 8. Design e acessibilidade

Tema padrão dark. Tokens de marca em `app/globals.css`:

- Fundo `#0A0A0B`, surface `#111214`, card `#17181B`, borda `#282A2E`.
- Texto principal `#F5F5F5`, secundário `#9A9CA3`.
- Azul `#2E6BFF` é acento/ação, não deve pintar a interface toda.
- Inter para texto e Manrope para títulos.

Preferir SVG e ícones Lucide, preservar foco visível e contraste, não comunicar
estado somente por cor e honrar `prefers-reduced-motion`. Reutilizar componentes
e tokens existentes; não introduzir cores fora do design system sem justificativa.

## 9. Execução local e ambiente

Requisitos indicados pelo projeto: Node.js 20+ e npm 9+.

```bash
npm install
cp .env.example .env.local
# Preencha as variáveis localmente; não as registre no Git.
npm run dev
```

Comandos de validação:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Variáveis importantes (nomes e exemplos seguros estão em `.env.example`):

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (somente servidor).
- IA: `AI_PROVIDER`, `AI_FALLBACK_PROVIDER`, `GEMINI_API_KEY`,
  `GROQ_API_KEY`, `OPENROUTER_API_KEY` e variáveis de modelo.
- App: `NEXT_PUBLIC_SITE_URL`.

## 10. Histórico e estado conhecido

Commits relevantes no histórico recente:

- `0acfee6`: expansão da biblioteca de estudo e exercícios do ENEM.
- `0029995`: controles de conta, senha, exclusão, temas escuros e social preview.
- `44d69f8`: progressão de nível por XP e barra do próximo nível.
- `5e269f8`: temas pretos animados.

Deploy público configurado: `https://nexo-pearl-pi.vercel.app`. Push em `main`
aciona o fluxo de deploy integrado à Vercel. O deploy do código e a aplicação de
migrations no Supabase são independentes; confirmar ambos separadamente.

Confirme no histórico da conversa/ambiente antes de tratar estas migrations
como aplicadas no banco: `20261010190000_add_xp_level_progression.sql` e
`20261010200000_add_black_animated_themes.sql`. O fato de um arquivo existir ou
estar publicado não comprova que o SQL foi executado.

## 11. Como continuar o desenvolvimento

1. Ler este arquivo, `AGENTS.md` e as seções relevantes de `PROMPT.txt`.
2. Conferir `git status` e preservar alterações já presentes no worktree.
3. Inspecionar implementação, migrations e testes antes de definir comportamento.
4. Implementar uma mudança pequena, completa e coerente em todas as superfícies
   afetadas.
5. Criar/atualizar testes para lógica importante e migration para mudanças de
   banco.
6. Rodar typecheck, lint, testes relevantes e build, conforme o escopo.
7. Informar quais arquivos/migrations mudaram e quais passos operacionais
   (Supabase, variáveis ou deploy) ainda dependem do usuário.

Não afirmar que uma alteração foi publicada, que uma migration foi aplicada ou
que uma integração funciona em produção sem verificar isso. Não incluir
segredos em resposta, documentação, logs ou commits.
