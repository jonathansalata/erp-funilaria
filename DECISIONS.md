# Decisões Técnicas (ADR leve)

Registro de decisões e ajustes tomados durante a implementação que se desviam ou complementam o
que está descrito em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Fase 0 — Fundação do Projeto (2026-06-11)

### 1. Versões mais recentes que a documentação original

O projeto foi criado com as versões estáveis mais recentes disponíveis no momento, que são mais
novas do que o conjunto de tecnologias considerado em ARCHITECTURE.md:

- Next.js **16.2.9** (App Router, Turbopack como bundler padrão)
- React **19.2.4**
- Tailwind CSS **v4** (configuração CSS-first)
- ESLint **9** (flat config)

Nenhuma decisão de arquitetura do ARCHITECTURE.md foi invalidada por isso, mas alguns detalhes de
configuração mudaram (ver itens abaixo).

### 2. Tailwind v4: sem `tailwind.config.ts`

ARCHITECTURE.md (seção 3) lista `tailwind.config.ts` na raiz. O Tailwind v4 adota configuração
**CSS-first**: tokens de cor, raio, fontes etc. ficam em `src/app/globals.css` via `@theme
inline` e variáveis CSS (`:root` / `.dark`). Não há `tailwind.config.ts` nem `content` glob —
o Tailwind v4 detecta os arquivos automaticamente via `@tailwindcss/postcss`.

**Decisão**: não criar `tailwind.config.ts`. Os "tokens de cor centralizados" mencionados na
seção 4.3 do ARCHITECTURE.md vivem em `src/app/globals.css`, que cumpre o mesmo papel.

### 3. `middleware.ts` → `proxy.ts`

A partir do Next.js 16, a convenção de arquivo `middleware.ts` foi renomeada para `proxy.ts`
(função `proxy` em vez de `middleware`). `middleware.ts` ainda funciona, mas gera aviso de
depreciação no build.

**Decisão**: o arquivo de guarda de rotas/refresh de sessão foi criado como `src/proxy.ts`
(exportando `proxy`). A lógica de refresh de sessão do Supabase permanece em
`src/lib/supabase/middleware.ts` (nome do arquivo mantido por ser apenas um helper interno, sem
relação com a convenção de arquivo do Next.js).

### 4. Shadcn/UI: componente `Form` substituído por `Field`

A versão atual do registry do Shadcn/UI (style `base-nova`) não inclui mais os componentes
`FormField`/`FormItem`/`FormControl`/`FormMessage` baseados em `react-hook-form` (o item `form`
do registry não gera arquivos). Em seu lugar, o registry oferece `src/components/ui/field.tsx`
(`Field`, `FieldGroup`, `FieldLabel`, `FieldError`, etc.) — primitivos de layout agnósticos de
biblioteca de formulário.

**Decisão**: para a Fase 0, apenas o componente `field.tsx` foi instalado. A partir da Fase 1,
os formulários (React Hook Form + Zod, conforme seção 4.2/4.3 do ARCHITECTURE.md) serão
construídos combinando `useForm`/`Controller` do `react-hook-form` com os primitivos `Field`.

### 5. `react-day-picker` v10: `classNames.table` → `month_grid`

O componente `calendar.tsx` gerado pelo Shadcn CLI referenciava a chave `table` em `classNames`,
que não existe mais em `react-day-picker@10` (renomeada para `month_grid`, conforme o enum
`UI` da biblioteca). Corrigido diretamente no arquivo gerado para `month_grid` — sem isso o
`tsc --noEmit` falhava.

### 6. `lib/utils.ts` (arquivo) em vez de `lib/utils/` (pasta)

ARCHITECTURE.md (seção 3) lista `lib/utils/` como diretório. O Shadcn CLI cria `src/lib/utils.ts`
(função `cn()`), exigido pelos componentes `ui/*` via alias `@/lib/utils`.

**Decisão**: manter `src/lib/utils.ts` como gerado pelo Shadcn (não criar uma pasta `utils/`
conflitante). Helpers adicionais específicos de domínio podem ser adicionados como novos
arquivos dentro de `src/lib/` (ex.: `src/lib/format.ts`) nas próximas fases, sem a necessidade de
uma pasta dedicada.

### 7. Estrutura de pastas: placeholders com `.gitkeep`

Todas as pastas previstas em ARCHITECTURE.md (seção 3) que ainda não possuem arquivos de código
(rotas do `(dashboard)`, `(auth)`, módulos de componentes, `hooks/queries`, `hooks/mutations`,
`stores`, `lib/auth`, `lib/validations`, `lib/constants`, etc.) foram criadas com um arquivo
`.gitkeep`, para que a árvore de diretórios fique versionada no Git sem conteúdo de negócio.

Nenhuma rota nova foi registrada no App Router: as pastas `(auth)` e `(dashboard)` não têm
`page.tsx`/`layout.tsx` ainda, portanto não afetam o roteamento atual (`/` continua servido por
`src/app/page.tsx`).

### 8. Supabase: `enable_signup = false` e `minimum_password_length = 8`

Em `supabase/config.toml`, ajustado `enable_signup = false` (sem cadastro público, conforme
seção 5.1 do ARCHITECTURE.md) e `minimum_password_length = 8` (recomendação do próprio arquivo de
config, alinhada a boas práticas de senha).

### 9. Migrations e seed como placeholders

Os 10 arquivos de migration (`0001`–`0010`) e `supabase/seed.sql` foram criados apenas com
cabeçalhos de comentário indicando seu propósito e a seção correspondente do ARCHITECTURE.md. O
schema real (tabelas, índices, RLS, triggers) será implementado a partir da Fase 1.

### 10. `database.types.ts` placeholder

`src/types/database.types.ts` exporta um tipo `Database` com schema `public` vazio (`Tables`,
`Views`, `Functions`, `Enums`, `CompositeTypes` como `Record<string, never>`), apenas para que os
clientes Supabase tipados (`createBrowserClient<Database>`, etc.) compilem. Será substituído pela
saída de `supabase gen types typescript` na Fase 1.
