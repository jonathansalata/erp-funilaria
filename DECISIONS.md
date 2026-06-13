# Decisões Técnicas (ADR leve)

Registro de decisões e ajustes tomados durante a implementação que se desviam ou complementam o
que está descrito em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Fase 2B.6 — Correções, Padronização e Fechamentos Operacionais (2026-06-13)

Fase de correções e padronizações sobre o ERP operacional mockado (Fase 1 + Fase 2B/2B.5), sem
Supabase, autenticação real ou RBAC backend (Fase 3 não iniciada). 13 blocos auditados e
corrigidos, mais 2 blocos novos (14 e 15) incorporados ao plano. Resumo por bloco:

- **Bloco 01 — Guard de hidratação antes de `notFound()`**: telas de detalhe (`Cliente`,
  `Veículo`, `Orçamento`, `Ordem de Serviço`, `Vistoria`) que dependem do estado persistido do
  Zustand (`useErpDataStore`) agora aguardam `hasHydrated` antes de decidir se o registro existe,
  evitando "não encontrado" piscando no primeiro render (antes da hidratação do
  `localStorage`).
- **Bloco 02 — URLs amigáveis por código de documento**: rotas `/orcamentos/[code]` e
  `/ordens-servico/[code]` (antes `[id]`) passam a aceitar o **código do documento** em minúsculas
  (ex.: `/orcamentos/orc-2026-000125`, `/os/os-2026-000090`) — **sem o nome do cliente na URL**,
  preparando compatibilidade com identificadores reais do Supabase na Fase 3.
  `OrcamentoDetailView`/`OrdemServicoDetailView` fazem lookup case-insensitive por `code` com
  fallback para `id` legado, e redirecionam (`router.replace`) para a URL canônica em minúsculas
  quando acessadas por `id`. Todos os ~17 pontos de navegação do app (Kanban, tabelas, dashboard,
  fichas de cliente/veículo, vistoria, ações de status) foram migrados de
  `/orcamentos/${quote.id}` / `/ordens-servico/${order.id}` para
  `/orcamentos/${quote.code.toLowerCase()}` / `/ordens-servico/${order.code.toLowerCase()}`.
- **Bloco 03 — Clique vazio na Agenda**: corrigido o clique em dias/slots vazios do calendário,
  que não abria o formulário de novo compromisso.
- **Bloco 04 — Agenda inteligente na conversão Orçamento → OS**: ao converter um orçamento
  aprovado em Ordem de Serviço, `ConvertToServiceOrderDialog` solicita **data e hora de entrega
  prevista**, oferece a opção de **criar automaticamente um agendamento de entrega** na Agenda
  (Cliente/Veículo/OS vinculada/Data/Hora/Tipo = Entrega) e **valida conflitos de horário**
  (outro compromisso "agendado" na mesma data/hora), alertando o usuário antes da confirmação.
- **Bloco 05 — `validUntil` na criação de orçamento**: o formulário de novo orçamento passa a
  capturar a validade do orçamento (`validUntil`), antes ausente.
- **Bloco 06 — Reset do modal de recebimento**: `ReceivePaymentDialog` agora reinicia
  valor/forma de pagamento/parcelas a cada abertura, evitando que dados do recebimento anterior
  vazassem para o próximo.
- **Bloco 07 — Confirmação de cancelamento (Financeiro)**: cancelamento de contas a
  receber/pagar passa a exigir confirmação via `ConfirmActionDialog`
  (`src/components/shared/confirm-action-dialog.tsx`, novo componente — confirmação em etapa
  única para ações reversíveis como Cancelar/Estornar/Encerrar/Converter, complementar ao
  `ConfirmDeleteDialog` existente para exclusões definitivas).
- **Bloco 08 — Estorno parcial/total**: `reverseReceivable`/`reversePayable` passam a suportar
  estorno de um lançamento individual (parcial) além do estorno total, com evento de auditoria
  específico (`payment_reversed`).
- **Bloco 09/10 — Ajustes de layout responsivo**: truncamento de textos longos no Financeiro e
  ajustes responsivos no Kanban e no fluxo de caixa (cashflow) para telas estreitas.
- **Bloco 11 — Padronização "Todos"/"Todas"**: filtros com opção "todos os itens" padronizados
  para a forma gramatical correta (masculino/feminino) conforme o substantivo do módulo.
- **Bloco 12 — Perfil do usuário (preparação Supabase Auth)**: nova store field
  `currentUserId` + tela `/configuracoes/perfil`
  (`src/components/configuracoes/profile-view.tsx`) exibindo dados do usuário "logado" (mock),
  permissões e edição de telefone/cargo. Estrutura criada para ser compatível com uma futura
  integração ao Supabase Auth (Fase 3) — **nenhuma autenticação real foi implementada**.
- **Bloco 14 (novo) — Visão operacional completa no Pátio**: clicar em qualquer card do Kanban
  do Pátio abre `PatioVehicleSheet`
  (`src/components/patio/patio-vehicle-sheet.tsx`), um painel lateral somente leitura com
  Cliente, Veículo, Vistoria/Orçamento/OS vinculados (mais recentes), Status/Etapa da jornada,
  Observações e a timeline completa de eventos do veículo (`getVehicleTimeline`) — sem precisar
  navegar para outros módulos. O botão "Mudar etapa" permanece funcional via
  `event.stopPropagation()`.
- **Bloco 15 (novo) — Padronização de ações destrutivas e auditoria**: auditoria completa de
  todos os pontos de Excluir/Cancelar/Estornar/Encerrar/Converter do sistema. Praticamente todo o
  sistema já estava em conformidade (confirmação via `ConfirmDeleteDialog`/`ConfirmActionDialog`/
  fluxos de status com diálogo, e registro de evento via `buildEntityEvent`). Único módulo com
  lacunas: **Agenda**. Corrigido:
  - `AppointmentFormDialog` (`src/components/agenda/appointment-form-dialog.tsx`): "Cancelar
    agendamento" agora exige confirmação via `ConfirmActionDialog` antes de efetivar o
    cancelamento (antes, o cancelamento era imediato ao clique).
  - `erp-data-store.ts`: `changeAppointmentStatus` e `deleteAppointment` agora geram
    `entity_events` (`buildEntityEvent`), com novo tipo de entidade `"appointment"` adicionado a
    `EntityType` (`src/lib/mock-data/entity-events.ts`, incluindo `ENTITY_TYPE_LABELS` e o mapa
    de módulos da tela de Auditoria em `src/app/(dashboard)/auditoria/page.tsx`). Cancelamento
    gera evento `inactivated`; demais mudanças de status geram `status_changed`; exclusão gera
    `deleted`.

### Regra permanente de documentação

A partir desta fase, **toda fase de implementação deve atualizar obrigatoriamente** este arquivo
(`DECISIONS.md`), a documentação técnica (`docs/ARCHITECTURE.md`, quando aplicável), o changelog
interno e a documentação funcional dos módulos afetados — não apenas o código.

## Fase 2B.6.1 — Correções Pós-Entrega e Consolidação Final da Fase 2 (2026-06-13)

Fase de correções pontuais sobre a Fase 2B.6, sem Supabase, autenticação real ou alterações de
arquitetura de banco de dados (Fase 3 não iniciada). 4 blocos:

- **Bloco 16 — Perfil do usuário ("This page couldn't load")**: causa raiz identificada como
  estado persistido (`localStorage`, chave `erp-data-store`) defasado em relação aos campos
  introduzidos nas fases anteriores — usuários gravados antes do Bloco 12/15 podiam não possuir
  `permissions[moduleKey]` para módulos novos (ex.: `agenda`), e o app **não possui `error.tsx`**
  em nenhuma rota, então qualquer exceção não tratada no render (ex.:
  `user.permissions.agenda.view` sobre `undefined`) zera a tela inteira (percebido como "This page
  couldn't load"). Corrigido em duas frentes:
  - Migração da `persist` store (`src/stores/erp-data-store.ts`) elevada de `version: 5` para
    `version: 6`: normaliza `users[]` preenchendo `permissions` ausentes com
    `emptyPermissionMatrix()` (cobrindo módulos novos como `agenda`) e migra `lastLogin` →
    `lastLoginAt` (ver Bloco 16.2).
  - `src/components/configuracoes/profile-view.tsx`: tabela de permissões passa a usar
    `user.permissions[moduleKey] ?? emptyPermissionMatrix()[moduleKey]` por módulo, eliminando o
    acesso indefinido que quebrava o render.
- **Bloco 16.1 — Usuário atual mock**: novo helper `resolveCurrentUser(users, currentUserId)`
  (`src/lib/mock-data/users.ts`) com fallback: `currentUserId` → primeiro usuário **ativo** com
  perfil **Administrador** → primeiro usuário **ativo**. Usado em
  `src/components/layout/header.tsx` (avatar/nome no menu do usuário, sem mais o placeholder
  genérico "Usuário"/"?") e em `profile-view.tsx` (tela `/configuracoes/perfil`).
- **Bloco 16.2 — Campo `lastLoginAt`**: campo `lastLogin` renomeado para `lastLoginAt` em `User`
  (`src/lib/mock-data/users.ts`), com comentário documentando que, em fase futura com Supabase
  Auth, este campo deve ser alimentado a partir de `last_sign_in_at`. Exibido como coluna "Último
  acesso" na listagem de Usuários (`src/components/usuarios/users-view.tsx`) e na tela de Perfil
  (`profile-view.tsx`). A migração v6 da store renomeia `lastLogin` → `lastLoginAt` em registros
  persistidos antigos.
- **Bloco 17 — Fluxo de estorno financeiro (bug de UX)**: causa raiz: o diálogo "Histórico"
  (`PaymentHistoryDialog`) expunha ações destrutivas de "Estornar" por lançamento, enquanto o
  botão "Estornar" oferecia apenas confirmação de estorno total às escuras — fluxo invertido.
  Corrigido com novo componente `src/components/financeiro/reverse-payment-dialog.tsx`
  (`ReversePaymentDialog`): lista todos os lançamentos (via `Timeline`), permite estorno parcial
  por lançamento individual (com confirmação) ou "Estornar tudo" (com confirmação), aplicado tanto
  em Contas a Receber quanto em Contas a Pagar
  (`src/components/financeiro/receivables-view.tsx`, `payables-view.tsx`).
  `PaymentHistoryDialog` (`src/components/financeiro/payment-history-dialog.tsx`) passa a ser
  **somente consulta**, sem ações destrutivas. Eventos de auditoria (`payment_reversed` /
  `reversed`) continuam emitidos pelas ações de store já existentes
  (`reverseReceivable`/`reverseReceivablePayment`/`reversePayable`/`reversePayablePayment`), sem
  alteração.
- **Bloco 18 — Templates de Checklist ("This page couldn't load")**: mesma classe de causa raiz do
  Bloco 16 (estado persistido defasado + ausência de `error.tsx`). A migração v6 da store também
  garante que `checklistTemplates` nunca fique vazio e que ambos os tipos (`inspection` e
  `service_order`) tenham ao menos um template, restaurando os padrões de
  `DEFAULT_CHECKLIST_TEMPLATES` quando necessário. Revisão estática completa de
  `checklist-templates-manager.tsx`, `configuracoes-view.tsx` e das ações de store
  (`createChecklistTemplate`/`updateChecklistTemplate`/`duplicateChecklistTemplate`/
  `toggleChecklistTemplateActive`/`deleteChecklistTemplate`) não encontrou outro defeito de
  código.
- **Bloco 19 — Auditoria final da Fase 2**: revisão de `NAV_GROUPS`
  (`src/lib/constants/navigation.ts`) contra as rotas existentes em `src/app/(dashboard)/` —
  todos os itens de navegação resolvem para páginas existentes. `user-permissions-dialog.tsx` já
  usa acesso seguro (`matrix?.[moduleKey]?.[action] ?? false`), sem necessidade de ajuste. Nenhum
  outro link quebrado, rota ausente ou componente não renderizado relacionado à Fase 2 foi
  encontrado.

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
