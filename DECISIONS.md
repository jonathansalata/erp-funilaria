# Decisões Técnicas (ADR leve)

Registro de decisões e ajustes tomados durante a implementação que se desviam ou complementam o
que está descrito em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Fase 2B.8 — Refinamentos Operacionais e UX Financeiro (2026-06-13)

Fase de ajustes pontuais em Financeiro e Relatórios, sem alteração de identidade visual, sem
Supabase/Auth/RBAC e sem início da Fase 3. Itens implementados nesta fase (Blocos 24, 26, 27 e
parte do Bloco 28); os Blocos 21 e 25 permanecem como proposta técnica (não implementados).

- **Bloco 24 — KPI "Vencidos" clicável em Contas a Pagar**: `financeiro/contas-a-pagar/page.tsx`
  passou a ser `async`, lendo `searchParams.status` e repassando como `initialStatus` para
  `PayablesView`, no mesmo padrão já usado em Ordens de Serviço/Vistorias/Orçamentos. O filtro de
  "Status" da `DataTable` (`payables-view.tsx`) ganhou a opção "Vencido", com `predicate` que usa
  `isOverdue(row.dueDate, row.status, "aberto")` (não é um status persistido, é calculado). O card
  KPI "Vencidos" agora é um `<Link href="/financeiro/contas-a-pagar?status=vencido">`, mesmo padrão
  de `operational-tab.tsx` no Dashboard.
- **Bloco 24.1 — Correção visual do filtro "Vencidos"**: a lógica do filtro já estava correta
  (`vencido` continua sendo 100% calculado — `PayableStatus` permanece `"aberto"|"pago"|"cancelado"`,
  sem novo status persistido). Dois problemas visuais davam a impressão de filtro errado: (1) a
  coluna "Status" de `payables-view.tsx` continuava exibindo o badge "Aberto" para títulos vencidos
  — agora exibe badge "Vencido" (variante destructive) quando `isOverdue(row.dueDate, row.status,
"aberto")` é verdadeiro; (2) o próprio `<SelectValue>` do filtro de Status/Categoria em
  `data-table.tsx`, sem `children`, caía no mesmo fallback de `resolveSelectedLabel` descrito no
  Bloco 22/23/28 e exibia o `value` cru (`vencido`, `aberto`) em vez do label (`Vencido`,
  `Aberto`) — corrigido com `children` render-prop que resolve o label via `filter.options`,
  aplicado a todos os filtros de `DataTable` do app.
- **Bloco 26 — Label dinâmica do campo "Fornecedor" em Contas a Pagar**: novo mapa
  `PAYABLE_SUPPLIER_LABEL: Record<PayableCategory, string>` em `financeiro.ts` (Salários →
  "Funcionário", Aluguel → "Beneficiário", Impostos → "Órgão/Beneficiário", demais categorias →
  "Fornecedor"/"Beneficiário"). `payable-form-dialog.tsx` usa
  `PAYABLE_SUPPLIER_LABEL[values.category]` no `<Label>` do campo `supplier`. Sem mudança de
  schema/banco — o campo continua sendo `supplier: string`.
- **Bloco 27 — Filtro Pessoa Física/Pessoa Jurídica em Relatórios > Clientes**: novo
  `clientFilters: DataTableFilter<Client>[]` em `reports-view.tsx`, com filtro "Tipo" baseado em
  `CLIENT_TYPE_LABELS` (`pessoa_fisica`/`pessoa_juridica`), passado via `filters={clientFilters}`
  para o `ReportTable` da aba Clientes — reaproveita o mecanismo de filtros já existente da
  `DataTable`.
- **Blocos 22/23/28 (parcial) — IDs internos visíveis em selects de Financeiro/Relatórios (causa
  raiz)**: a auditoria original havia validado apenas as **colunas de tabela** (que já usavam
  `getClientById`/`getVehicleLabelById` corretamente). A causa real reportada está nos
  **`<Select>` usados como filtro/campo**: o componente `SelectValue` do Base UI
  (`@base-ui/react/select/value/SelectValue.js`), quando não recebe `children` (render-prop) nem
  o `Select.Root` recebe a prop `items`, resolve o texto do _trigger_ via
  `resolveSelectedLabel(value, items, itemToStringLabel)`
  (`@base-ui/react/internals/resolveValueLabel.js`), que cai no fallback `stringifyAsLabel(value)`
  — ou seja, exibe o **valor bruto selecionado** (ex.: `cli-006`, `vei-002`), mesmo que o
  `<SelectItem>` correspondente no dropdown mostre o nome correto. Corrigido nos dois pontos com
  evidência confirmada, usando a função `children` de `SelectValue` (suportada nativamente e
  priorizada antes da resolução por `items`):
  - `financial-reports-view.tsx` — filtros "Cliente" (`fr-client`) e "Veículo" (`fr-vehicle`)
    passaram a resolver o label via `getClientById`/`getVehicleLabelById`.
  - `receivable-form-dialog.tsx` — select "Cliente" do formulário de conta a receber passou a
    resolver o label via `getClientById`.
  - **Escopo restante do Bloco 28** (não coberto nesta fase): existem ~21 arquivos com
    `<SelectValue>`, mas a maioria está ligada a enums com labels já legíveis (status, categorias,
    formas de pagamento, abas). O padrão acima (children render-prop) deve ser replicado sempre
    que um `<Select>` tiver `value` ligado a um id de entidade (`clientId`, `vehicleId`, etc.).
- **Bloco 24.2 — Auditoria/confirmação do filtro KPI "Vencidos"**: revalidada a cadeia completa
  `contas-a-pagar/page.tsx` → `PayablesView({ initialStatus })` → `DataTable
initialFilters={{ status: initialStatus }}`. Confirmado, via build local e verificação no
  servidor de desenvolvimento, que ao acessar `?status=vencido` a tabela retorna exclusivamente os
  títulos com `status === "aberto" && isOverdue(dueDate, status, "aberto")` — o mesmo cálculo usado
  por `getPayablesSummary` para o KPI "Vencidos" — ou seja, contador da tabela e KPI já são
  consistentes (a lógica do Bloco 24/24.1 já cobria o requisito). Único ajuste de código deste
  bloco: a opção do filtro de Status em `payables-view.tsx` passou de `{ label: "Vencido", value:
"vencido" }` para `{ label: "Vencidos", value: "vencido" }` (plural, espelhando o título do card
  KPI "Vencidos") para que o `<Select>` de Status exiba "Vencidos" quando a página é aberta via
  `?status=vencido`.

### Propostas técnicas não implementadas (Blocos 21 e 25)

- **Bloco 21 — Documento de Garantia/Entrega (PDF)**: proposta revisada — persistir
  `warrantyPeriod` (prazo de garantia) e `deliveryMileage`/`deliveredAt` (KM e data de entrega) no
  tipo `ServiceOrder` (`service-orders-data.ts`), com edição em um bloco "Dados de Entrega" na tela
  de detalhe da OS. O PDF de garantia (`warranty-pdf.ts`, seguindo o padrão de
  `service-order-pdf.ts`) leria esses campos persistidos, evitando inconsistência entre o PDF
  gerado e os dados da OS. Aguardando validação.
- **Bloco 25 — DRE Comparativo**: duas alternativas propostas, ambas reaproveitando
  `getDreSummary` (já pura e recebe `monthPrefix`): (A) comparativo automático "Mês Atual x Mês
  Anterior" (sem interação do usuário, baixo risco); (B) comparativo multi-mês com seleção manual
  de meses. Recomendação: implementar (A) nesta fase e deixar (B) para demanda futura. Aguardando
  validação.

## Fase 2B.7 — Refinamento UX/UI Mobile Global (2026-06-13)

Fase exclusivamente de refinamento da experiência **Mobile**, sem alteração de identidade visual
(tipografia, componentes, espaçamentos desktop) nem de regras de negócio (Fase 3 não iniciada,
Supabase/Auth/RBAC inalterados). Auditoria global de responsividade nos 12 módulos do ERP
(Dashboard, Pipeline de Orçamentos, Pipeline de OS, Pátio, Vistorias, Agenda, Clientes, Veículos,
Financeiro, Relatórios, Configurações, Usuários) e correção dos pontos de overflow horizontal e
componentes desktop espremidos em mobile.

- **Padrão global obrigatório (causa raiz)**: nenhuma regra impedia o `<body>` de gerar scroll
  horizontal quando algum elemento interno excedia a largura da viewport. Adicionado
  `overflow-x: hidden` ao `body` em `src/app/globals.css`. Scroll horizontal permanece permitido
  apenas dentro de containers próprios (tabelas via `Table`/`overflow-x-auto`, Kanban, listas
  técnicas).
- **Pipeline de Orçamentos e Pipeline de OS — tabela de itens estourando a página (causa raiz)**:
  `quote-detail-client.tsx` e `service-order-detail-client.tsx` usam `<div className="grid gap-6
xl:grid-cols-3">` com uma coluna `xl:col-span-2`. Itens de grid/flex têm `min-width: auto` por
  padrão, então uma tabela larga (`Itens do orçamento` / `Itens / Serviços`) forçava a coluna —
  e a página inteira — a crescer além da viewport, mesmo com o componente `Table` já envolvendo o
  `<table>` em `overflow-x-auto`. Corrigido adicionando `min-w-0` ao grid principal e às duas
  colunas (`flex flex-col gap-6 xl:col-span-2` e `flex flex-col gap-6`), permitindo que o `Card`
  encolha até a largura da viewport e o scroll horizontal fique contido **dentro** do card da
  tabela. Observações, anexos (FileDropzone) e histórico/timeline já eram responsivos e não
  precisaram de ajuste adicional.
- **Relatórios — navegação principal (7 abas) e sub-abas de Relatórios Financeiros (8 abas)**:
  aplicado o mesmo padrão Select-mobile + Tabs-desktop já validado em Configurações (Fase 2B.6.2).
  `reports-view.tsx` e `financial-reports-view.tsx` tiveram seus `Tabs` tornados controlados
  (`activeTab`/`activeReportTab`), com um `Select` de largura total exibido apenas em `<sm`
  (`sm:hidden`) e o `TabsList` original oculto em mobile (`hidden sm:flex`).
- **Relatórios — filtros do relatório financeiro**: grid `grid gap-3 sm:grid-cols-2 lg:grid-cols-5`
  já empilhava em coluna única abaixo de `sm`, mas os `Select` (Cliente, Veículo, Forma de
  pagamento, Status) usavam a largura padrão `w-fit`, ficando estreitos e desalinhados em mobile.
  Adicionado `className="w-full"` a cada `SelectTrigger`. O filtro de Veículo passou a exibir
  "Placa — Modelo/Marca/Ano" (`{vehicle.plate} — {getVehicleLabel(vehicle)}`) em vez de apenas a
  placa, tornando o rótulo mais amigável (demais filtros — Cliente, Forma de pagamento, Status —
  já usavam nome/label legível e a opção "Todos"/"Todas").
- **`ReportTable` — cabeçalho do card**: `CardHeader` com `flex flex-row items-start
justify-between` espremia título + botões de exportar PDF/CSV/Imprimir na mesma linha em telas
  estreitas. Alterado para `flex flex-col items-start gap-4 sm:flex-row sm:justify-between`
  (mesmo padrão já usado em `checklist-templates-manager.tsx`), empilhando título e ações em
  mobile.
- **Área de toque — Agenda**: botões de navegação do calendário (mês/semana/dia anterior e
  próximo) em `appointment-calendar.tsx` estavam em `size="icon-sm"` (28px); elevados para
  `size="icon"` (32px), consistente com o ajuste já feito em Configurações na Fase 2B.6.2.
- **Área de toque — Anexos (`FileDropzone`)**: botão de remover arquivo usava `size="icon-xs"`
  (24px); elevado para `size="icon-sm"` (28px) — usado em Orçamentos, OS (fotos antes/depois) e
  demais módulos com upload.
- **Demais pontos auditados sem necessidade de correção**: `KanbanBoard` (Pátio/Kanban) já usa
  `overflow-x-auto` com colunas `w-[85vw] sm:w-72`; `DataTable`/`ReportTable` já usa `Table` com
  `overflow-x-auto` e filtros em `flex flex-wrap`; `FileDropzone` já usa grid responsiva
  (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`); `PaymentMethodsEditor` (Financeiro) usa `flex
flex-wrap` com `min-w-[Npx]`, portanto os campos quebram linha em mobile sem causar overflow;
  `EntityHeader` já empilha título/ações (`flex-col sm:flex-row`, `flex-wrap`).

### Validação mobile (Fase 2B.7)

Revisão estática em 320px/360px/390px/412px/480px/768px (sem ferramenta de browser disponível no
ambiente), cobrindo os 12 módulos auditados: sem overflow horizontal de página (`body
overflow-x-hidden` + `min-w-0` nos containers de tabela), navegação de Relatórios (principal e
financeira detalhada) como `Select` de largura total até 640px, filtros do relatório financeiro em
coluna única com `w-full`, botões de ação com no mínimo 32px (`icon`)/28px (`icon-sm`), e nenhuma
tabela/cards quebrando o layout da página (scroll, quando necessário, contido no card).

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

## Fase 2B.6.2 — Responsividade Mobile do Módulo Configurações (2026-06-13)

Fase focada exclusivamente na experiência mobile de Configurações (320px–768px), sem alterações
de regras de negócio, Supabase, autenticação real ou início da Fase 3.

- **Bloco 20 — Responsividade completa**:
  - **Causa raiz (1) — Tabs horizontais quebrando o layout**: a navegação principal de
    Configurações usava `TabsList` com 10 abas em linha (`flex-wrap`), e a navegação interna de
    Catálogos usava `Tabs orientation="vertical"` com uma coluna fixa de 7 abas — ambas
    inviáveis em telas ≤480px. **Solução**: `src/components/configuracoes/configuracoes-view.tsx`
    passou a ser um componente controlado (`activeTab`/`activeCatalog` via `useState`). Em
    telas `<sm` (640px), a navegação principal e a navegação de Catálogos são exibidas como
    `Select` (`@/components/ui/select`) ocupando a largura total; em `sm:` e acima, os `TabsList`
    originais (ocultos via `hidden sm:flex`/`hidden h-fit sm:flex`) voltam a ser exibidos. `Tabs`
    e `Select` compartilham o mesmo estado, preservando o conteúdo de cada aba sem duplicar
    lógica.
  - **Causa raiz (2) — Menu lateral de Catálogos ocupando espaço excessivo**: resolvido pelo
    mesmo `Select` de Catálogos descrito acima — em mobile, o menu lateral de 7 itens (Serviços,
    Categorias, Centros de Custo, Equipes, Motivos de Cancelamento/Recusa, Modelos de
    Observação) dá lugar a um único `Select`, liberando 100% da largura para o conteúdo.
  - **Causa raiz (3) — Cards/formulários comprimidos e overflow horizontal**: linhas de
    listagem (`flex items-center gap-3`) usavam `flex-1` sem `min-w-0`, permitindo que nomes
    longos empurrassem a linha além da largura do card (overflow horizontal). **Solução**:
    aplicado o padrão `min-w-0 flex-1 truncate` ao texto principal e agrupamento das ações
    (`Switch`/botões) em `<div className="flex shrink-0 items-center gap-1">`, em
    `catalog-manager.tsx`, `status-config-manager.tsx`, `payment-methods-manager.tsx`,
    `banks-manager.tsx`, `technicians-manager.tsx` e `checklist-templates-manager.tsx`. Botões
    "Adicionar"/"Novo template" passam a `w-full` em mobile e `w-fit`/`self-end` em `sm:`. Os
    grids de formulário (`grid gap-3/gap-4 sm:grid-cols-...`) já eram coluna única por padrão em
    mobile — mantidos sem alteração estrutural.
  - **Bloco 18 (Templates de Checklist) em mobile**: `CardHeader` de
    `checklist-templates-manager.tsx` passou de `flex-row` fixo para `flex-col items-start gap-4
sm:flex-row sm:justify-between` (botão "Novo template" abaixo do título em mobile, full
    width). Linha de cada template usa `flex-wrap` com nome/descrição em `basis-full
sm:basis-auto` e ações agrupadas. No diálogo de edição, `Input` de nome de
    etapa/item recebeu `min-w-0 flex-1` para não empurrar o botão de remover para fora da tela.
  - **Área de toque**: todos os botões de ação (`Pencil`, `Trash2`, `Check`, `X`, `Copy`) nas
    listagens de Configurações foram elevados de `size="icon-sm"` (28px) para `size="icon"`
    (32px), reduzindo o risco de toques acidentais em telas pequenas.
  - **Modais**: `DialogContent` (`@/components/ui/dialog`) já usa
    `max-w-[calc(100%-2rem)]` e `DialogFooter` já empilha botões em coluna em mobile
    (`flex-col-reverse sm:flex-row`) — confirmado sem necessidade de alteração. O diálogo de
    edição de template de checklist (`max-h-[85vh] overflow-y-auto`) ganhou `w-full` explícito
    para preencher a largura disponível em mobile.
  - **Tabela de Logs Técnicos**: `src/components/ui/table.tsx` já envolve a tabela em
    `overflow-x-auto` — scroll horizontal contido dentro do card, sem afetar o layout da página.
    Confirmado sem alteração.

Validação mobile (320px, 360px, 390px, 412px, 480px, 768px) realizada por revisão estática do
HTML/Tailwind gerado (sem ferramenta de browser disponível no ambiente): em todas as larguras,
a navegação principal e a de Catálogos usam `Select` de largura total até 640px; linhas de
listagem não excedem a largura do card (`min-w-0`/`truncate`); formulários permanecem em coluna
única; modais cabem em `calc(100%-2rem)` com rolagem interna.

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
