# Decisões Técnicas (ADR leve)

Registro de decisões e ajustes tomados durante a implementação que se desviam ou complementam o
que está descrito em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Fase 2B.5 — Consolidação Operacional, Eliminação de Hardcodes e Fechamento de Lacunas Funcionais (2026-06-12)

Fase de consolidação sobre o ERP operacional mockado (Fase 1), sem Supabase, autenticação, RBAC
backend ou integrações externas. Principais entregas:

- **Templates de checklist** (`src/lib/mock-data/checklist-templates.ts`): modelo
  `ChecklistTemplate`/`ChecklistTemplateStage`, templates padrão para Vistoria e Ordem de
  Serviço. CRUD completo em Configurações > Templates de Checklist
  (`src/components/configuracoes/checklist-templates-manager.tsx`), com duplicar, ativar/inativar
  e excluir (bloqueado se for o único template ativo do tipo). Templates podem ser selecionados
  ao criar novas vistorias/OS, preenchendo o checklist automaticamente.
- **Edição de orçamento** (`src/components/orcamentos/quote-edit-dialog.tsx` +
  `updateQuote` em `erp-data-store.ts`): permite editar cliente, veículo, itens, observações e
  validade enquanto o orçamento estiver em Rascunho, Enviado ou Em negociação. Gera evento de
  auditoria na linha do tempo.
- **Edição de ordem de serviço** (`src/components/ordens-servico/service-order-edit-dialog.tsx` +
  `updateServiceOrder` em `erp-data-store.ts`): permite editar itens, observações e previsão de
  entrega enquanto a OS não estiver Entregue/Cancelada. Técnico responsável continua sendo
  alterado via ações de status (`ServiceOrderStatusActions`). Gera evento de auditoria.
- **PDF e WhatsApp para documentos** (`src/lib/pdf/quote-pdf.ts`,
  `src/lib/pdf/service-order-pdf.ts`, `src/lib/whatsapp.ts`): telas de Orçamento e OS ganharam
  botões "Exportar PDF" / "Imprimir" (via infraestrutura compartilhada `src/lib/pdf/pdf-utils.ts`)
  e "Enviar por WhatsApp" (abre `wa.me` com mensagem padrão usando o WhatsApp/telefone do
  cliente).
- **Ficha 360° do cliente e ficha completa do veículo**
  (`src/lib/pdf/client-pdf.ts`, `src/lib/pdf/vehicle-pdf.ts`): botão "Exportar PDF"/"Imprimir" nas
  telas de detalhe de Cliente e Veículo. A ficha do veículo passou a exibir indicadores (total de
  orçamentos, total de OS, valor gasto, última visita) usando `getVehicleSummary` (já existente em
  `lib/mock-data/crm.ts`).
- **Ajuda**: novos artigos em `HELP_ARTICLES` (`src/lib/mock-data/settings.ts`) cobrindo edição de
  orçamento/OS, templates de checklist, exportação de PDF/WhatsApp e as fichas 360° de
  cliente/veículo.

Pendências conhecidas (não tratadas nesta fase): PDFs dedicados para Vistoria; "equipe"
responsável na OS (não existe `teamId` no modelo `ServiceOrder`); catálogos de serviço aplicados
em todos os módulos que ainda usam categorias fixas.

## Fase 0.5 — Design System e Layout Base (2026-06-11)

Revisão de UX/arquitetura de navegação realizada antes da Fase 1 (ver ARCHITECTURE.md v1.2,
seção 4.6). Esta fase entrega **apenas a fundação visual**: sidebar, header, breadcrumbs, temas,
dashboards e pipelines com dados mockados — sem CRUD, sem Supabase e sem autenticação.

### 1. Paleta de cores

Paleta de marca fornecida (hex) mapeada para os tokens semânticos do Shadcn/Tailwind v4 em
`src/app/globals.css`, mantendo a estrutura de variáveis já gerada na Fase 0 (`@theme inline`):

| Hex       | Papel                                                                       |
| --------- | --------------------------------------------------------------------------- |
| `#152F45` | Navy — `primary` (claro), `background`/`sidebar` (escuro)                   |
| `#3F4955` | Slate — `secondary`/`accent` (escuro), `sidebar-accent` (claro)             |
| `#6A798C` | Slate claro — `muted-foreground`, `ring`                                    |
| `#C6BEB4` | Areia/Taupe — `secondary`/`accent` (claro), `primary` (escuro)              |
| `#F7F5F2` | Off-white — `background` (claro), `foreground`/`sidebar-foreground` (ambos) |
| `#FFFFFF` | Branco — `card`/`popover` (claro)                                           |

**Tema claro**: fundo `#F7F5F2`, cards `#FFFFFF`, texto/primary `#152F45`, secundário/accent
`#C6BEB4`. **Tema escuro**: fundo `#0E2233` (variação mais escura do navy, derivada para manter
contraste AA com texto `#F7F5F2`), cards `#18324B`, primary `#C6BEB4` (inverte para destacar
ações sobre fundo escuro).

**Sidebar**: usa o tom navy (`#152F45` no claro, `#0B1B29` no escuro) **em ambos os temas** —
decisão de manter identidade visual consistente da marca independente do tema do conteúdo.

**Cores de status** (`config_categories.color`, usadas em `StatusBadge`/`KanbanBoard`/cards do
Pátio) recebem tokens semânticos adicionais — não fazem parte da paleta de marca, mas precisam
harmonizar com ela: `--color-success` (verde acinzentado), `--color-warning` (âmbar), `--color-info`
(azul-acinzentado), `--color-destructive` (vermelho-tijolo). Cada um com par `-foreground` para
contraste em claro/escuro.

### 2. Tipografia

Fonte de marca **Josefin Sans** (Google Fonts, via `next/font/google`), substituindo `Geist Sans`
como `--font-sans`/`--font-heading`. `Geist Mono` é removido (não há necessidade de fonte
monoespaçada na UI nesta fase).

### 3. Navegação e estrutura de rotas

- Sidebar reorganizada em 5 grupos (Visão Geral, Atendimento, Cadastros, Financeiro, Gestão),
  conforme ARCHITECTURE.md seção 4.6.1, definidos em `src/lib/constants/navigation.ts`.
- O grupo "Gestão" inicia recolhido; estado de colapso da sidebar e dos grupos persistido via
  Zustand (`src/stores/ui-store.ts`) + `localStorage`.
- `src/app/page.tsx` (placeholder da Fase 0) foi **substituído** por
  `src/app/(dashboard)/page.tsx` (Dashboard) — a rota `/` passa a ser servida pelo grupo
  `(dashboard)`, que agora possui `layout.tsx` (shell: sidebar + header + breadcrumbs).
- Novas rotas placeholder criadas para permitir navegação completa: `/vistorias`, `/patio` e
  demais módulos do roadmap (clientes, veículos, agenda, financeiro, relatórios, auditoria,
  usuários, configurações) — todas com conteúdo "Em construção", sem dados/lógica.

### 4. Componentes da fundação visual

- `KanbanBoard`/`KanbanColumn`/`KanbanCard` (genéricos, dados mockados) usados em
  `/orcamentos` e `/ordens-servico`.
- `KpiCard`, `StatusBadge` com variantes de cor semânticas.
- Sistema de tabelas: wrapper visual sobre `components/ui/table.tsx` (sem TanStack Table nesta
  fase — paginação/ordenação reais ficam para os módulos com dados reais).
- Sistema de formulários: composição de `components/ui/field.tsx` + `react-hook-form`
  (estrutura visual, sem submissão/validação contra backend).
- Dashboard dividido em abas/seções "Operacional" e "Gerencial" (ARCHITECTURE.md seção 4.6.3),
  ambas com dados mockados em `lib/constants` ou arquivos locais de mock.

### 5. Modelagem de dados (revisão pré-Fase 1)

Itens incorporados ao schema (ver ARCHITECTURE.md seções 7.4.1, 7.4.2, 7.11.1, 9.1 e roadmap
Fase 5.5) — **ainda não implementados em migrations**, apenas documentados:

- `vehicle_inspections` + `inspection_items` (módulo de Vistoria, novo módulo RBAC `vistorias`).
- `vehicle_shop_visits` + taxonomia `vehicle_journey_stage` (Pátio/Jornada do Veículo).
- Espelhamento de `entity_events` para `entity_type='vehicle'` (timeline completa do veículo).

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
