# ARQUITETURA — ERP Funilaria, Pintura e Gestão Automotiva

> Status: **Aprovada para iniciar a Fase 0 — nenhum código foi implementado ainda.**
> Versão: 1.1 (revisão técnica para SaaS multiempresa, integrações futuras e escala)
> Data: 2026-06-11

## Changelog

- **v1.18** — Bloco 37 (resiliência do `AuthProvider`, logout, "Alterar Senha" e diagnóstico do
  proxy de auth, 2026-06-14): causa raiz comum de 4 problemas em produção (sem logout acessível,
  avatar do Header não abria "Meu Perfil", `/configuracoes/perfil` e Checklist Templates caindo
  em `global-error.tsx`) — `src/components/providers/auth-provider.tsx` envolve todo o
  `(dashboard)/layout.tsx` e qualquer exceção não tratada em `createClient()`/
  `getSession()`/`onAuthStateChange()`/`loadProfileAndPermissions()`/`signOut()` (ex.: env vars
  `NEXT_PUBLIC_SUPABASE_*` ausentes em Production) gerava uma promise rejeitada não tratada,
  escalando para `global-error.tsx` e impedindo todo o dashboard de renderizar. Corrigido com
  `try/catch/finally` em todos os pontos de chamada ao Supabase no provider, degradando para
  estado "sem sessão" em vez de lançar; `signOut()` sempre limpa estado e redireciona para
  `/login`. `src/components/auth/login-form.tsx` ganhou `try/catch` em `handleSubmit` (evita
  botão preso em "Entrando..." em caso de erro inesperado). `src/components/layout/header.tsx`
  ganhou item "Alterar Senha" (`/redefinir-senha`) no dropdown do usuário. Diagnóstico adicional
  registrado: `/` não redireciona em produção porque `NEXT_PUBLIC_SUPABASE_URL`/
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` aparentam ausentes/incorretas no ambiente Production do Vercel
  (`src/lib/supabase/middleware.ts` faz bypass sem essas vars) — pendência de configuração,
  fora do escopo de código. Ver [DECISIONS.md](../DECISIONS.md#bloco-37--resiliência-do-authprovider-logout-alterar-senha-e-diagnóstico-do-proxy-2026-06-14).
- **v1.17** — Bloco 36 (correção do CRUD de usuários — modal "Editar" abrindo vazio,
  2026-06-14): causa raiz em `src/components/usuarios/user-form-dialog.tsx` — `values` só era
  sincronizado a partir da prop `user` dentro de `handleOpenChange` (callback `onOpenChange` do
  Base UI), que não dispara quando o modal é aberto via `setFormOpen(true)` (componente
  controlado em `users-view.tsx`). Corrigido com sincronização durante a renderização (mesmo
  padrão `loadedProfileId`/`syncedKey` de `profile-view.tsx`): novo estado `syncedKey` guarda a
  identidade da abertura atual (`user.id` em EDIT, `"__new__"` em CREATE, `null` quando fechado);
  quando diverge do `dialogKey` calculado, `values` é recalculado (`EMPTY_VALUES` em CREATE, dados
  do `user` em EDIT). Garante que "Editar A → Fechar → Editar B" carregue os dados de B e que
  "Novo usuário" sempre comece vazio. `npm run typecheck`/`lint`/`build` validados (28 rotas).
  Detalhes em `DECISIONS.md`, seção "Bloco 36".
- **v1.16** — Fase 3.3.1 + 3.3.2 (correção do fluxo de autenticação e UX do login, 2026-06-14):
  causa raiz do bug crítico "`/` exibe 'This page couldn't load' em vez de redirecionar para
  `/login`" identificada em `src/lib/supabase/middleware.ts` — `supabase.auth.getUser()` sem
  `try/catch` relançava erros (cookie inválido/expirado, falha de rede) e derrubava o Proxy
  inteiro. Corrigido com `try/catch` (erro = usuário não autenticado). Criados `src/app/error.tsx`
  e `src/app/global-error.tsx` (App Router não tinha nenhum `error.tsx`, então qualquer exceção de
  render zerava a tela — mesma causa raiz dos Blocos 16/18 da Fase 2B.6.1). `LoginForm`
  reformulado (campos `h-12`, mostrar/ocultar senha, checkbox "Manter conectado", link "Esqueci
  minha senha"). Novo fluxo de recuperação de senha: `/recuperar-senha`
  (`resetPasswordForEmail`) e `/redefinir-senha` (`exchangeCodeForSession` +
  `updateUser({ password })`), ambas marcadas como rotas públicas no middleware. Revalidadas as
  pendências "Perfil do Usuário" (resolvida na Fase 3.3) e "Templates de Checklist" (resolvida
  enquanto o módulo permanecer mock). `npm run build`/`lint`/`tsc --noEmit` validados (28 rotas).
  Detalhes em `DECISIONS.md`, seção "Fase 3.3.1 + 3.3.2".
- **v1.15** — Fase 3.3 (autenticação real Supabase, 2026-06-13): substituído o acesso aberto
  pelo fluxo real de auth (login/logout/refresh/proteção de rotas), mantendo todos os módulos
  funcionais (Clientes, Veículos, Vistorias, Agenda, Orçamentos, OS, Financeiro) e os stores
  Zustand em mock. Novos: `AuthProvider` (`src/components/providers/auth-provider.tsx`),
  `useAuth()`/`usePermissions()` (`src/hooks/`), tela `/login`
  (`src/app/(auth)/login`, `src/components/auth/login-form.tsx`), proteção de rotas em
  `src/lib/supabase/middleware.ts` (redirect para `/login` se não autenticado; `/login` é a
  única rota pública). Duas migrations novas (`0011_auth_helpers.sql`,
  `0012_auth_profile_helpers.sql`) adicionam RPCs `SECURITY DEFINER`
  (`fn_get_my_permissions`, `fn_get_my_role_name`, `fn_update_my_profile`) que resolvem RBAC e
  atualização do próprio perfil via `auth.uid()`, contornando a dependência de
  `fn_current_org_id()`/`fn_current_role_id()` (claims de `app_metadata` ainda não populadas —
  Custom Access Token Hook não configurado, pendência para fase futura de RBAC completo). Corrigido
  bug de login (`500 Database error querying schema`) causado por colunas `NULL` em
  `auth.users` no seed. Corrigidos os dois bugs pendentes "Perfil do Usuário" e "Templates de
  Checklist" (`ProfileView` reescrito com dados reais; `onRehydrateStorage` em
  `erp-data-store.ts` corrigido). `npm run build`/`lint`/`tsc --noEmit` validados (24 rotas).
  Detalhes em `DECISIONS.md`, seção "Fase 3.3".
- **v1.14** — Fase 3.2 (provisionamento Supabase, 2026-06-13): as 10 migrations e o seed foram
  aplicados no projeto Supabase já vinculado (`erp-funilaria`); `src/types/database.types.ts`
  gerado via `supabase gen types typescript --linked` (2919 linhas), substituindo o placeholder
  da Fase 0; `npm run build`/`npm run lint` validados com a nova tipagem. Corrigido bug
  estrutural descoberto na aplicação de `0010_storage_policies.sql`:
  `vehicle_shop_visits` (sem `deleted_at`/`deleted_by` por design) estava incluída no `DO $$ ...
  $$
  ` de RLS padrão que assume soft delete; recebeu policies dedicadas sem essa condição.
  Corrigido `supabase/seed.sql` para usar `extensions.crypt`/`extensions.gen_salt`
  (pgcrypto fica no schema `extensions` no Supabase cloud). Criado `.env.example` e ajustado
  `.gitignore` (`!.env*.example`) para versionar os templates de variáveis de ambiente. Sem
  alteração de stores Zustand e sem início de Auth/login. Detalhes em `DECISIONS.md`, seção
  "Fase 3.2".
  $$
- **v1.13** — Fase 3.1.2 (correções da auditoria das migrations, 2026-06-13): corrigidos os 2
  findings da auditoria "Fase 3.1.1". (1) `fn_financial_audit_trigger`
  (`0009_audit.sql`) referenciava `NEW.organization_id`, coluna inexistente em
  `accounts_receivable_payments`/`accounts_payable_payments`, o que quebraria o hash-chain de
  auditoria financeira em recebimentos/pagamentos/estornos; a resolução de `organization_id`
  passou a ser ramificada por `TG_TABLE_NAME`, buscando a entidade pai
  (`accounts_receivable`/`accounts_payable`) para as tabelas de pagamento. (2) `document_sequences`
  era a única das 37 tabelas sem RLS; adicionada `ENABLE ROW LEVEL SECURITY` + policy de SELECT
  por `fn_current_org_id()` (`0010_storage_policies.sql`), sem afetar
  `fn_next_document_number` (SECURITY DEFINER). Nenhuma store, Auth, Supabase ou dado foi
  alterado/iniciado. Detalhes em `DECISIONS.md`, seção "Fase 3.1.2".
- **v1.12** — Fase 3.1 (migrations, schema SQL, seeds e RLS, 2026-06-13): implementadas as 10
  migrations (`supabase/migrations/0001` a `0010`) e `supabase/seed.sql` a partir do schema
  consolidado em `docs/FASE3_SCHEMA.sql`, com 3 ajustes adicionais aprovados:
  `organization_id NOT NULL` em toda entidade de negócio, soft delete (`deleted_at`/`deleted_by`)
  nas entidades principais (incl. nova tabela `file_metadata`), e `fn_next_document_number`
  transacional/concorrente-safe (`SELECT ... FOR UPDATE` + `INSERT ... ON CONFLICT ... DO
UPDATE`). RLS consolidado em `0010_storage_policies.sql`, incluindo a regra de que UPDATE
  (soft delete) é autorizado por `'edit' OR 'delete'`. Stores Zustand permanecem inalteradas —
  migração para Supabase fica para a Fase 3.2. Detalhes em `DECISIONS.md`, seção "Fase 3.1".
- **v1.11** — Fase 3.0 (inventário, arquitetura e planejamento Supabase, 2026-06-13): auditoria
  completa do modelo mockado real (Fases 1-2B) contra o schema v1.1 aqui descrito, identificando
  ~15 divergências (novas tabelas como `checklist_templates`/`bank_accounts`, campos novos em
  `vehicles`/`service_orders`/`accounts_receivable`/`accounts_payable`, ajustes em `permissions`
  (7 ações), `entity_events`/`audit_logs` (enums expandidos), `config_categories` (necessidade de
  coluna `code` imutável), entre outros). Plano técnico completo (inventário por entidade,
  estratégia de migração, plano de Auth/RBAC/Storage/Segurança, diagrama ER e ordem de execução
  Fase 3.1-3.13) consolidado em `docs/FASE3_PLANO.md`. Esta etapa é apenas planejamento — nenhuma
  migration, tabela ou store foi alterada. Detalhes em `DECISIONS.md`, seção "Fase 3.0".
- **v1.10** — Fase 2B.8.5 (versionamento automático e metadados de build, 2026-06-13): nova fonte
  única `src/lib/app-metadata.ts`, que lê `version` de `package.json` e expõe `getAppMetadata()`
  com `version`, `build` (SHA git/Vercel truncado, ou `"local"`), `deploy` (data do
  commit/build) e `environment` (`development → Desenvolvimento`, `preview → Homologação`,
  `production → Produção`). `next.config.ts` resolve `NEXT_PUBLIC_GIT_SHA`,
  `NEXT_PUBLIC_BUILD_DATE` e `NEXT_PUBLIC_VERCEL_ENV` a partir de `VERCEL_GIT_COMMIT_SHA`/
  `VERCEL_ENV` (Vercel) ou do git local. `SidebarVersion` e `AboutSystem` passam a consumir
  `getAppMetadata()`; `src/lib/version.ts` foi removido. O fluxo `npm version
patch|minor|major` agora reflete automaticamente no rodapé. Detalhes em `DECISIONS.md`, seção
  "Fase 2B.8.5".
- **v1.9** — Fase 2B.8.4 (estabilização final pré-Fase 3, 2026-06-13): corrigidos os dois últimos
  bugs críticos da Fase 2. `ProfileView` (`/configuracoes/perfil`) e `ChecklistTemplatesManager`
  (Configurações → Templates de Checklist) liam dados persistidos via `zustand/persist`
  (`users`/`currentUserId` e `checklistTemplates`) sem aguardar `hasHydrated`, causando erro de
  hidratação e "This page couldn't load"; ambos agora retornam `null` enquanto `!hasHydrated`,
  seguindo o mesmo padrão já usado em `client-detail-view.tsx`, `vehicle-detail-view.tsx`,
  `inspection-detail-view.tsx`, `orcamento-detail-view.tsx` e `ordem-servico-detail-view.tsx`.
  Também corrigido o aviso "Base UI: A component that acts as a button expected a native
  <button>...": `Button` (`button.tsx`) e `SheetClose` (`sheet.tsx`) agora detectam quando `render`
  aponta para um elemento que não é `<button>` (ex.: `<Link>`, `<a>`) e aplicam
  `nativeButton={false}` automaticamente, sem alterar a marcação ou a acessibilidade. Auditoria
  final de rotas confirmou build e navegação sem erros. Detalhes em `DECISIONS.md`, seção
  "Fase 2B.8.4".
- **v1.8** — Fase 2B.8.3 (consolidação operacional pré-Fase 3, 2026-06-13): clique no KPI
  "Vencidos" (Contas a Pagar) agora atualiza tabela, filtro visual e contador instantaneamente, sem
  F5 — `DataTable` realinha `activeFilters`/paginação durante a renderização quando
  `initialFilters` muda; `ServiceOrder` ganha campos opcionais `deliveryMileage`, `deliveredAt` e
  `warrantyPeriod` com novo card "Entrega e Garantia" na tela de detalhe da OS e novo documento PDF
  "Termo de Garantia e Entrega" (`warranty-pdf.ts`), sem alterar o PDF de OS existente; DRE Gerencial
  ganha card "Comparativo: Mês Atual x Mês Anterior" (Receita Bruta, Custos, Resultado Operacional,
  Despesas, Lucro Líquido com variação %), reaproveitando `getDreSummary`. Detalhes em
  `DECISIONS.md`, seção "Fase 2B.8.3".
- **v1.7** — Fase 2B.8 (refinamentos operacionais e UX financeiro, 2026-06-13): KPI "Vencidos" de
  Contas a Pagar passa a ser clicável (`/financeiro/contas-a-pagar?status=vencido`), com filtro de
  status "Vencido" calculado via `isOverdue`; badge "Vencido" substitui "Aberto" na coluna Status
  quando o título está em atraso; campo "Fornecedor" do formulário de Contas a Pagar ganha label
  dinâmica por categoria (`PAYABLE_SUPPLIER_LABEL`); Relatórios > Clientes ganha filtro Pessoa
  Física/Jurídica; corrigida exibição de IDs internos/valores crus (`cli-006`, `vei-002`,
  `vencido`) nos selects de Cliente/Veículo do relatório financeiro detalhado, do formulário de
  Contas a Receber e nos filtros genéricos da `DataTable`, causa raiz identificada na resolução de
  label do `SelectValue` (Base UI) sem `children`/`items`; opção do filtro de Status "Vencido" →
  "Vencidos" (plural, espelhando o card KPI) e revalidação confirmando que o filtro
  `?status=vencido` retorna exclusivamente `status === "aberto" && isOverdue(...)`, consistente com
  o KPI. Detalhes em `DECISIONS.md`, seção "Fase 2B.8".
- **v1.6** — Fase 2B.7 (refinamento UX/UI mobile global, 2026-06-13): `body` ganha
  `overflow-x: hidden` (nenhuma página pode gerar scroll lateral); telas de detalhe de Orçamento e
  OS recebem `min-w-0` nos containers do grid principal para conter o scroll da tabela de itens
  dentro do card; navegação de Relatórios (principal e Relatórios Financeiros) passa a usar
  `Select` de largura total em `<sm` (mesmo padrão de Configurações); filtros do relatório
  financeiro com `SelectTrigger` `w-full` e rótulo de Veículo "Placa — Modelo"; `ReportTable`
  empilha título/ações em mobile; botões de navegação do calendário da Agenda e de remover anexo
  elevados para `icon`/`icon-sm`. Detalhes em `DECISIONS.md`, seção "Fase 2B.7".
- **v1.5** — Fase 2B.6.2 (responsividade mobile do módulo Configurações, 2026-06-13): navegação
  principal de Configurações e navegação interna de Catálogos (antes `TabsList`/`Tabs
orientation="vertical"`) passam a usar `Select` de largura total em telas `<sm` (640px),
  liberando 100% da largura para o conteúdo; linhas de listagem dos gerenciadores (Catálogos,
  Status, Formas de Pagamento, Bancos, Técnicos, Templates de Checklist) usam `min-w-0
flex-1 truncate` para eliminar overflow horizontal; botões de ação elevados de `icon-sm` para
  `icon` (melhor área de toque). Detalhes em `DECISIONS.md`, seção "Fase 2B.6.2".
- **v1.4** — Fase 2B.6.1 (correções pós-entrega e consolidação final da Fase 2, 2026-06-13):
  migração da `persist` store para `version: 6` normalizando `permissions` de usuários antigos e
  `checklistTemplates`; novo helper `resolveCurrentUser` para resolver o usuário "logado" mock no
  Header e na tela de Perfil; campo `User.lastLogin` renomeado para `lastLoginAt` (preparação para
  `last_sign_in_at` do Supabase Auth), exibido em Usuários e Perfil; novo
  `ReversePaymentDialog` corrige o fluxo de estorno financeiro (Histórico passa a ser somente
  consulta) em Contas a Receber e Contas a Pagar. Detalhes em `DECISIONS.md`, seção
  "Fase 2B.6.1".
- **v1.3** — Fase 2B.6 (correções e padronizações operacionais, 2026-06-13): URLs amigáveis de
  Orçamento/OS passam a usar apenas o código do documento (`/orcamentos/orc-2026-000125`,
  `/ordens-servico/os-2026-000090`); conversão Orçamento → OS ganhou agendamento inteligente de
  entrega com validação de conflitos na Agenda; tela de Perfil do usuário
  (`/configuracoes/perfil`) preparada para futura integração com Supabase Auth; Pátio ganhou
  painel operacional completo por veículo (`PatioVehicleSheet`); padronização de confirmação e
  auditoria (`entity_events`) para todas as ações destrutivas, incluindo novo tipo de entidade
  `appointment`. Detalhes em `DECISIONS.md`, seção "Fase 2B.6".
- **v1.2** — Revisão de UX/Navegação e arquitetura operacional específica de funilaria, realizada como **Fase 0.5 (Design System e Layout Base)**, antes do início da Fase 1. Principais mudanças: módulo de **Vistoria** (`vehicle_inspections` + itens de checklist polimórficos), controle de **jornada do veículo no pátio** (`vehicle_shop_visits` + taxonomia `vehicle_journey_stage`), **pipelines visuais (Kanban)** para Orçamentos e Ordens de Serviço, **Dashboard segmentado** em visão Operacional (rotina diária) e Gerencial (KPIs/financeiro), **espelhamento de `entity_events`** para timeline completa do veículo (cross-entidade), e reorganização da navegação (sidebar) em grupos por frequência de uso. A fundação visual (sidebar, header, breadcrumbs, dashboards, pipelines, temas claro/escuro) foi implementada nesta fase. Detalhes nas seções 4.6, 7.4.1, 7.4.2, 7.11, 9.1 e 11 (Fase 0.5 e Fase 5.5).
- **v1.1** — Revisão técnica solicitada antes da Fase 0. Principais mudanças: tabela `organizations` real (multi-tenant desde o início), claims customizados no JWT, numeração amigável (`document_sequences`), timeline de eventos (`entity_events`), notificações internas, auditoria financeira imutável com hash-chain (`financial_audit_logs`), tabela genérica de arquivos (`file_metadata`), stubs de integração (WhatsApp, NF-e/NFS-e, gateways de pagamento), estratégia de views materializadas/particionamento e dimensão `scope` no RBAC. Detalhes na seção 14.
- **v1.0** — Proposta inicial.

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack e Decisões Técnicas](#2-stack-e-decisões-técnicas)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Arquitetura Frontend](#4-arquitetura-frontend)
5. [Arquitetura Backend (Supabase)](#5-arquitetura-backend-supabase)
6. [Modelagem do Banco de Dados](#6-modelagem-do-banco-de-dados)
7. [Tabelas, Relacionamentos, Índices e RLS](#7-tabelas-relacionamentos-índices-e-rls)
8. [Sistema RBAC de Permissões](#8-sistema-rbac-de-permissões)
9. [Padronização Global / Sistema de Taxonomias](#9-padronização-global--sistema-de-taxonomias)
10. [Realtime](#10-realtime)
11. [Roadmap de Implementação por Fases](#11-roadmap-de-implementação-por-fases)
12. [Convenções e Boas Práticas](#12-convenções-e-boas-práticas)

---

## 1. Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                          │
│  Next.js App (React 18+, TS, Tailwind, Shadcn/UI)                  │
│  - SSR / RSC para páginas iniciais                                  │
│  - Client Components para interatividade (forms, tabelas, modais)  │
│  - TanStack Query (cache de dados do servidor)                     │
│  - Zustand (estado de UI: tema, sidebar, filtros)                   │
└───────────────┬──────────────────────────────────┬─────────────────┘
                │ supabase-js (client)              │ Server Actions /
                │                                    │ Route Handlers
                ▼                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                          SUPABASE (BaaS)                            │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────────────────┐   │
│  │ Auth           │ │ PostgreSQL    │ │ Storage                  │   │
│  │ - Email/Senha  │ │ - Tabelas     │ │ - Fotos veículos          │   │
│  │ - Recuperação  │ │ - RLS         │ │ - Documentos              │   │
│  │   de senha     │ │ - Triggers    │ │ - Anexos OS / Orçamentos  │   │
│  │ - Sessões JWT  │ │ - Functions   │ │ - Avatares de usuário     │   │
│  └───────────────┘ └───────────────┘ └─────────────────────────┘   │
│  ┌───────────────┐ ┌─────────────────────────────────────────────┐ │
│  │ Realtime       │ │ Edge Functions                              │ │
│  │ - Agenda       │ │ - Geração de PDF (orçamento/OS)              │ │
│  │ - Dashboard    │ │ - Envio de e-mails transacionais             │ │
│  │ - Status de OS │ │ - Webhooks (futuro: pagamentos, WhatsApp)     │ │
│  └───────────────┘ └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    HOSPEDAGEM (Vercel — Free Tier)                  │
│  - Deploy automático via Git                                        │
│  - Edge/Serverless Functions para Route Handlers                    │
│  - Variáveis de ambiente (.env) para chaves Supabase                │
└──────────────────────────────────────────────────────────────────┘
```

### Princípios arquiteturais

- **BaaS-first**: Supabase concentra autenticação, dados, storage e realtime — minimiza necessidade de backend próprio.
- **Server Actions / Route Handlers do Next.js** atuam como camada fina de backend para: operações que exigem `service_role` (ex.: criação de usuários, reset de senha administrativo), geração de PDFs, regras de negócio que não devem residir só no client.
- **RLS como última linha de defesa**: toda regra de acesso crítica é replicada no banco via RLS, mesmo que o frontend já filtre.
- **Sem contas públicas**: criação de usuário é uma operação administrativa (via Server Action com `service_role`), nunca via `supabase.auth.signUp` exposto ao público.
- **Soft delete universal**: nenhuma exclusão física de dados operacionais — tudo via `deleted_at`.
- **Auditoria automática**: alterações relevantes capturadas via triggers `AFTER INSERT/UPDATE/DELETE` que gravam em `audit_logs` (e em `financial_audit_logs` para tabelas financeiras — ver seção 7.13).
- **Multi-tenant desde o início (SaaS-ready)**: existe uma tabela `organizations` real desde a Fase 1. Todas as tabelas de negócio possuem `organization_id UUID NOT NULL REFERENCES organizations(id)` (sem "default mágico"). A v1 opera com **uma única organização semente**, mas o isolamento já é roteado por RLS + claims do JWT — eliminando migração estrutural quando a segunda empresa for onboarded.
- **Claims customizados no JWT**: um Auth Hook (`custom_access_token_hook`) injeta `organization_id` e `role_id` no JWT (em `app_metadata`) no momento do login/refresh. Isso permite que `fn_current_org_id()` e `fn_has_permission()` resolvam o isolamento por tenant e as permissões **sem consultas adicionais por linha** em cada policy de RLS — essencial para performance em volume alto.
- **Design system único**: Shadcn/UI + Tailwind tokens compartilhados, tema claro/escuro via `next-themes`, persistido por usuário (campo em `profiles`).

---

## 2. Stack e Decisões Técnicas

| Camada            | Tecnologia                                                          | Observações                                       |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| Framework         | Next.js 14+ (App Router)                                            | RSC + Server Actions                              |
| Linguagem         | TypeScript (strict mode)                                            | Tipagem gerada do Supabase (`supabase gen types`) |
| UI                | Tailwind CSS + Shadcn/UI (Radix)                                    | Componentes acessíveis, customizáveis             |
| Ícones            | lucide-react                                                        | Padrão do Shadcn                                  |
| Estado servidor   | TanStack Query v5                                                   | Cache, invalidação, optimistic updates            |
| Estado UI         | Zustand                                                             | Tema, sidebar, filtros voláteis                   |
| Formulários       | React Hook Form + Zod                                               | Validação client = mesma schema usada no backend  |
| Tabelas           | TanStack Table                                                      | Tabelas avançadas (ordenação, paginação, filtros) |
| Calendário/Agenda | FullCalendar (ou `react-big-calendar`)                              | Drag & drop, visões dia/semana/mês                |
| Gráficos          | Recharts                                                            | Dashboard                                         |
| PDF               | `@react-pdf/renderer` (Edge Function) ou `pdf-lib`                  | Orçamentos e OS                                   |
| Datas             | `date-fns`                                                          | Manipulação e formatação                          |
| Backend           | Supabase (Postgres 15, Auth, Storage, Realtime, Edge Functions)     |                                                   |
| Hospedagem        | Vercel (Free)                                                       | Deploy contínuo via Git                           |
| Lint/Format       | ESLint + Prettier                                                   |                                                   |
| Testes            | Vitest + Testing Library (unit) / Playwright (e2e) — fase posterior |                                                   |

---

## 3. Estrutura de Pastas

```
erp-funilaria/
├── docs/
│   └── ARCHITECTURE.md
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── recuperar-senha/
│   │   │   └── redefinir-senha/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Shell: sidebar + topbar + theme
│   │   │   ├── page.tsx                  # Dashboard
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── novo/
│   │   │   │   └── [id]/
│   │   │   ├── veiculos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── vistorias/                # Módulo de Vistoria (seção 7.4.1)
│   │   │   │   ├── page.tsx              # Lista de vistorias
│   │   │   │   ├── novo/                 # Nova vistoria (vehicle_id/client_id pré-preenchidos)
│   │   │   │   └── [id]/                 # Detalhe/edição + geração de orçamento
│   │   │   ├── patio/                    # Jornada do veículo / Pátio (seção 7.4.2)
│   │   │   │   └── page.tsx              # Board por current_stage (vehicle_shop_visits)
│   │   │   ├── agenda/
│   │   │   │   └── page.tsx
│   │   │   ├── orcamentos/
│   │   │   │   ├── page.tsx              # Pipeline (Kanban) + Lista — toggle (seção 4.6)
│   │   │   │   ├── novo/
│   │   │   │   └── [id]/
│   │   │   ├── ordens-servico/
│   │   │   │   ├── page.tsx              # Pipeline (Kanban) + Lista — toggle (seção 4.6)
│   │   │   │   └── [id]/
│   │   │   ├── financeiro/
│   │   │   │   ├── contas-a-receber/
│   │   │   │   ├── contas-a-pagar/
│   │   │   │   ├── fluxo-de-caixa/
│   │   │   │   └── dre/
│   │   │   ├── relatorios/
│   │   │   │   ├── financeiro/
│   │   │   │   ├── clientes/
│   │   │   │   ├── veiculos/
│   │   │   │   ├── ordens-servico/
│   │   │   │   ├── orcamentos/
│   │   │   │   └── produtividade/
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   ├── auditoria/
│   │   │   │   └── page.tsx
│   │   │   └── configuracoes/
│   │   │       ├── categorias-servico/
│   │   │       ├── categorias-pecas/
│   │   │       ├── categorias-financeiras/
│   │   │       ├── formas-pagamento/
│   │   │       ├── status/
│   │   │       ├── motivos-cancelamento/
│   │   │       ├── tipos-agendamento/
│   │   │       ├── perfil/
│   │   │       └── permissoes/
│   │   ├── api/
│   │   │   ├── pdf/
│   │   │   │   ├── orcamento/[id]/route.ts
│   │   │   │   └── os/[id]/route.ts
│   │   │   └── webhooks/
│   │   ├── layout.tsx                    # Root layout (ThemeProvider, QueryProvider)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                           # Shadcn primitives
│   │   ├── layout/                       # Sidebar, Header/Topbar, Breadcrumbs, Nav (seção 4.6)
│   │   ├── shared/                       # DataTable, ComboboxAsync, FileUpload, EmptyState,
│   │   │                                 # KanbanBoard, KpiCard, StatusBadge, EntityHeader,
│   │   │                                 # TimelinePanel, ItemsEditor (seções 4.4 e 4.6)
│   │   ├── forms/                        # Form fields reutilizáveis
│   │   └── modules/                      # Componentes específicos por módulo
│   │       ├── clientes/
│   │       ├── veiculos/
│   │       ├── vistorias/                # Diagrama de avarias, checklist de vistoria
│   │       ├── patio/                    # Board de jornada do veículo
│   │       ├── agenda/
│   │       ├── orcamentos/               # Inclui Pipeline (Kanban) de orçamentos
│   │       ├── ordens-servico/           # Inclui Pipeline (Kanban) de OS
│   │       ├── dashboard/                # Painéis Operacional e Gerencial
│   │       ├── financeiro/
│   │       ├── relatorios/
│   │       ├── usuarios/
│   │       ├── auditoria/
│   │       └── configuracoes/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # browser client
│   │   │   ├── server.ts                 # server component / action client
│   │   │   ├── middleware.ts             # refresh de sessão
│   │   │   └── admin.ts                  # service_role client (server-only)
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   └── permissions.ts            # helpers de RBAC no client
│   │   ├── validations/                  # Zod schemas por entidade
│   │   ├── utils/
│   │   └── constants/                    # módulos, ações, enums espelhados do DB
│   │                                     # navigation.ts: estrutura da sidebar por grupos (seção 4.6)
│   ├── hooks/
│   │   ├── queries/                      # useClientes, useVeiculos, useOrcamentos...
│   │   └── mutations/
│   ├── stores/                           # Zustand stores
│   ├── types/
│   │   └── database.types.ts             # gerado via `supabase gen types typescript`
│   └── middleware.ts                     # auth guard + permission guard
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init_extensions.sql
│   │   ├── 0002_rbac.sql
│   │   ├── 0003_taxonomies.sql
│   │   ├── 0004_clients_vehicles.sql
│   │   ├── 0005_agenda.sql
│   │   ├── 0006_quotes.sql
│   │   ├── 0007_service_orders.sql
│   │   ├── 0008_financial.sql
│   │   ├── 0009_audit.sql
│   │   └── 0010_storage_policies.sql
│   ├── seed.sql
│   └── config.toml
├── .env.local.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Arquitetura Frontend

### 4.1 Roteamento e camadas

- **Route Groups**: `(auth)` para fluxo não autenticado, `(dashboard)` para área logada com layout compartilhado (sidebar, topbar, breadcrumbs).
- **Server Components por padrão**: páginas de listagem fazem fetch inicial via Server Component (SSR), hidratando o cache do TanStack Query (`HydrationBoundary`) para que client components reaproveitem os dados sem novo round-trip.
- **Client Components**: formulários, tabelas interativas, modais, multi-selects, drag & drop da agenda.

### 4.2 Gerenciamento de estado

- **Servidor (dados)**: TanStack Query — cada entidade tem hooks dedicados (`useClientes`, `useClienteById`, `useCreateCliente`, etc.) com chaves de cache padronizadas (`['clientes', filtros]`).
- **UI (cliente)**: Zustand para tema, estado da sidebar, filtros de relatório, wizard de orçamento/OS (estado multi-step antes de persistir).
- **Formulários**: React Hook Form + `zodResolver`. Schemas Zod compartilhados entre validação de formulário e validação de Server Action (mesma fonte de verdade).

### 4.3 Design System

- Shadcn/UI como base de componentes (Button, Dialog, Sheet, Table, Form, Combobox, Command, Calendar, Tabs, Badge, etc.).
- Tema claro/escuro via `next-themes`, com preferência persistida em `profiles.theme_preference` (sincronizada no login) + `localStorage` para resposta instantânea.
- Tokens de cor centralizados em `globals.css` (CSS variables), permitindo customização de marca futura.
- Layout responsivo: sidebar colapsável (desktop), drawer (mobile), tabelas com modo "cards" em telas pequenas.

### 4.4 Componentes-chave reutilizáveis

| Componente                    | Função                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DataTable`                   | Tabela genérica (TanStack Table) com paginação, ordenação, filtros, exportação                                                                               |
| `ComboboxAsync`               | Select com busca assíncrona (clientes, veículos, serviços, peças)                                                                                            |
| `MultiSelectTags`             | Seleção múltipla de categorias/serviços com criação inline                                                                                                   |
| `QuickCreateDialog`           | Modal de "cadastro rápido" para categorias/serviços/peças sem sair da tela                                                                                   |
| `FileUploadZone`              | Upload para Supabase Storage (fotos, documentos, anexos) com preview                                                                                         |
| `StatusBadge`                 | Badge padronizado de status (cores via taxonomia)                                                                                                            |
| `PermissionGate`              | Componente que oculta/desabilita ações conforme RBAC                                                                                                         |
| `AuditTrailDrawer`            | Painel lateral com histórico de alterações de um registro                                                                                                    |
| `MoneyInput` / `MoneyDisplay` | Formatação monetária BRL                                                                                                                                     |
| `KanbanBoard`                 | Board genérico orientado a `status_id` (colunas = `config_categories` de um `type` configurável); usado em Pipeline de Orçamentos e Pipeline de OS (ver 4.6) |
| `KpiCard`                     | Card compacto de indicador (valor + variação/sparkline) usado nos Dashboards                                                                                 |
| `EntityHeader`                | Cabeçalho padrão de telas de detalhe (número do documento, `StatusBadge`, ações)                                                                             |
| `TimelinePanel`               | Renderiza `entity_events` em formato de linha do tempo vertical (ver 7.11)                                                                                   |
| `ItemsEditor`                 | Tabela editável de itens (`quote_items`/`service_order_items`) com cálculo automático de totais                                                              |

### 4.5 Camada de permissões no frontend

- Hook `usePermissions()` carrega o "mapa efetivo de permissões" do usuário (resolvido no backend — ver seção 8) uma vez no login e mantém em contexto/Zustand.
- `<PermissionGate module="financeiro" action="edit">` envolve botões/campos sensíveis.
- `middleware.ts` bloqueia rotas para usuários sem permissão de `view` no módulo, redirecionando para página "Acesso negado" ou Dashboard.

### 4.6 Navegação, Pipelines e Dashboards (UX — Fase 0.5)

Esta seção registra as decisões de UX/navegação tomadas na revisão pré-Fase 1 ("Fase 0.5 — Design System e Layout Base"), que reorganizam a forma como os módulos descritos nas seções 6–9 são apresentados ao usuário, sem alterar o modelo de dados além do já previsto em 7.4.1, 7.4.2 e 7.11.

#### 4.6.1 Sidebar — agrupamento por frequência de uso

A navegação lateral é organizada em 5 grupos, refletindo o fluxo operacional real (Cliente → Veículo → Vistoria → Orçamento → Aprovação → OS → Execução → Entrega → Financeiro), não a ordem alfabética das entidades:

| Grupo           | Itens                                                                               | Frequência de uso                 |
| --------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| **Visão Geral** | Dashboard (Operacional / Gerencial)                                                 | Diária (abertura)                 |
| **Atendimento** | Pipeline de Orçamentos · Pipeline de Ordens de Serviço · Pátio · Vistorias · Agenda | Constante                         |
| **Cadastros**   | Clientes & Veículos                                                                 | Frequente                         |
| **Financeiro**  | Contas a Receber · Contas a Pagar · Fluxo de Caixa · DRE                            | Diária/semanal                    |
| **Gestão**      | Relatórios · Auditoria · Usuários · Configurações                                   | Esporádica (recolhido por padrão) |

- A estrutura é definida estaticamente em `lib/constants/navigation.ts` (array de grupos → itens, cada item mapeado a um `module` de `permissions`) e filtrada em runtime por `usePermissions()` — **não exige tabela de menu no banco**.
- O grupo **Gestão** inicia recolhido (estado persistido em Zustand/`localStorage`) para reduzir ruído visual sem remover acesso.
- "Clientes & Veículos" é um único item de sidebar que aponta para `/clientes`; `/veiculos` continua existindo como rota própria (acessível a partir do detalhe do cliente e de buscas diretas).

#### 4.6.2 Pipelines visuais (Kanban) — Orçamentos e Ordens de Serviço

- `/orcamentos` e `/ordens-servico` abrem, por padrão, em **visão Kanban** (componente `KanbanBoard`), com toggle para a `DataTable` tradicional (Lista) — ambas as visões consultam os mesmos dados, sem rotas adicionais.
- **Colunas = `config_categories`** do tipo `quote_status` (Orçamentos) ou `service_order_status` (OS) — já configuráveis pelo usuário em Configurações → Status, sem hardcode.
- **Drag & drop** entre colunas atualiza `status_id` da entidade e dispara `fn_log_entity_event` (mesma trilha usada para a timeline — seção 7.11).
- Cards exibem: número do documento (`quote_number`/`os_number`), cliente, veículo (placa/modelo), valor total e indicadores visuais de atraso (ex.: orçamento "Enviado" há mais de N dias, OS com `expected_delivery_date` vencida, ou `status = 'Aguardando Peça'` há muito tempo).
- No Pipeline de OS, é possível agrupar/filtrar por técnico (`assigned_to`) — útil para balanceamento de carga. Quando o papel `Técnico` usar `scope='own'` (seção 8.5), o board filtra automaticamente apenas as OS do usuário autenticado.

#### 4.6.3 Dashboard — Operacional vs. Gerencial

A tela inicial (`/`, dentro do grupo `(dashboard)`) é dividida em duas zonas/abas:

- **Operacional ("Hoje na Oficina")** — prioridade visual máxima, voltada a Atendentes/Técnicos:
  - Contadores: carros na oficina agora (`vehicle_shop_visits` com `checked_out_at IS NULL`), entradas/saídas previstas hoje, OS aguardando peça.
  - Lista de "Ações Pendentes" clicáveis: vistorias concluídas sem orçamento gerado, orçamentos "Enviado" sem resposta há mais de N dias, OS com entrega atrasada, parcelas vencendo hoje.
- **Gerencial ("Visão do Negócio")** — KPIs financeiros e funil de orçamentos (faturamento do mês, ticket médio, OS por status), alimentados por `mv_dashboard_kpis`/`mv_revenue_by_month`/`mv_service_order_funnel` (seção 10.1) — na Fase 0.5 e fases iniciais, exibidos com dados mockados.
- Visibilidade por papel: `Atendente`/`Técnico` veem a aba Operacional expandida por padrão; `Gerente`/`Administrador` veem ambas, com a Gerencial expandida. A aba Gerencial é controlada por `<PermissionGate module="financeiro" action="view">`.
- Todos os contadores/cards são clicáveis e levam à visão filtrada correspondente (Pipeline, Pátio, Financeiro) — o Dashboard funciona como roteador de atenção, não apenas vitrine de números.

#### 4.6.4 Pátio (Jornada do Veículo)

- Nova tela `/patio`, dentro do grupo **Atendimento**, exibe um board por `current_stage` (taxonomia `vehicle_journey_stage` — seção 9.1) com um card por `vehicle_shop_visits` em aberto (`checked_out_at IS NULL`).
- É a visão "chão de fábrica" complementar ao Pipeline de OS: enquanto o Pipeline de OS reflete o status _comercial/de trabalho_ da OS, o Pátio reflete a posição _física_ do veículo na operação (aguardando vistoria, aguardando aprovação, em execução, aguardando peça, pronto para retirada).
- Detalhes do modelo de dados em 7.4.2.

---

## 5. Arquitetura Backend (Supabase)

### 5.1 Autenticação

- Supabase Auth com provider **Email/Senha** apenas.
- **Sem signup público**: a tela de login não expõe cadastro. Criação de usuários é feita por administradores via Server Action que usa `supabase.auth.admin.createUser()` (client `service_role`, executado apenas no servidor).
- Fluxo de "Recuperar senha" usa `resetPasswordForEmail` (Supabase envia e-mail). Implementado na
  Fase 3.3.1/3.3.2: `/recuperar-senha` (solicita o e-mail) e `/redefinir-senha` (troca o `code` da
  URL por sessão via `exchangeCodeForSession` e define a nova senha via `updateUser`).
- "Lembrar acesso" = sessão persistente padrão do Supabase (refresh token em cookie httpOnly via `@supabase/ssr`). Checkbox "Manter conectado" presente na UI desde a Fase 3.3.2; semântica de
  cookie de sessão vs. persistente (`cookieOptions.maxAge`) ainda não diferenciada — pendência
  para a Fase 3.4.
- Tabela `profiles` (1:1 com `auth.users`) guarda dados adicionais (nome, telefone, foto, cargo, status, tema, `organization_id`, `role_id`).
- O middleware (`src/lib/supabase/middleware.ts`) envolve `supabase.auth.getUser()` em
  `try/catch`: erros (cookie inválido/expirado, falha de rede) são tratados como "sem usuário
  autenticado" em vez de derrubar o Proxy (Fase 3.3.1).
- **Custom Access Token Hook** (`auth.custom_access_token_hook`, configurado em `config.toml`/Dashboard): a cada emissão/refresh de token, lê `profiles.organization_id` e `profiles.role_id` e injeta em `app_metadata` do JWT. `fn_current_org_id()` e `fn_current_role_id()` (SQL functions `STABLE`) leem esses claims via `auth.jwt()`, evitando joins repetidos em cada policy de RLS.

### 5.2 Camadas de acesso ao Postgres

1. **Cliente browser** (`anon` key): leitura/escrita direta via supabase-js, protegida por RLS.
2. **Server (Server Actions / Route Handlers)** (`anon` key + sessão do usuário via cookies): mesma RLS, usado quando é necessário compor lógica antes de persistir (ex.: gerar número sequencial de orçamento).
3. **Admin (`service_role`)**: somente em rotas server-only, para: criação/exclusão de usuários no Auth, reset administrativo de senha, operações que precisam ignorar RLS de forma controlada (ex.: jobs de auditoria).

### 5.3 Storage (Buckets)

| Bucket                      | Conteúdo                                     | Acesso                                                                        |
| --------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `avatars`                   | Fotos de perfil de usuários                  | Público leitura, escrita autenticada (próprio usuário ou admin)               |
| `vehicle-photos`            | Fotos de veículos                            | Privado, via RLS de Storage (usuário autenticado com permissão em `veiculos`) |
| `vehicle-documents`         | Documentos (CRLV, etc.)                      | Privado                                                                       |
| `service-order-attachments` | Fotos/anexos de OS (checklist, antes/depois) | Privado                                                                       |
| `quote-attachments`         | Anexos de orçamento                          | Privado                                                                       |
| `generated-pdfs`            | PDFs gerados (orçamento/OS)                  | Privado, URL assinada temporária                                              |

Estrutura de paths: `{bucket}/{organization_id}/{entity_id}/{filename}` para permitir policies por prefixo.

### 5.4 Edge Functions

| Função                         | Responsabilidade                                           |
| ------------------------------ | ---------------------------------------------------------- |
| `generate-quote-pdf`           | Monta PDF do orçamento a partir dos dados + template       |
| `generate-service-order-pdf`   | Monta PDF da OS                                            |
| `send-transactional-email`     | E-mails (boas-vindas, redefinição, notificações de agenda) |
| `audit-cleanup` (cron, futuro) | Arquivamento de logs antigos                               |

### 5.5 Funções e Triggers do Postgres (visão geral)

- `fn_set_updated_at()` — trigger `BEFORE UPDATE` para atualizar `updated_at`.
- `fn_audit_trigger()` — trigger genérico `AFTER INSERT/UPDATE/DELETE` que grava em `audit_logs` (diff de colunas alteradas, usuário, IP via `request.headers`).
- `fn_normalize_text(text)` — `lower(unaccent(trim(text)))`, usada em índices únicos das taxonomias.
- `fn_has_permission(module, action)` — função `STABLE` que lê os claims do JWT (`organization_id`, `role_id`) e checa permissão efetiva (papel + overrides) usada nas policies de RLS.
- `fn_current_org_id()` / `fn_current_role_id()` — funções `STABLE` que extraem claims do JWT (`auth.jwt() -> 'app_metadata'`).
- `fn_next_document_number(org_id, entity_type)` — gera números amigáveis sequenciais por organização (ver seção 7.10), usando `document_sequences` com `SELECT ... FOR UPDATE`.
- `fn_increment_taxonomy_usage()` — mantém `usage_count` das categorias/serviços atualizado (contadores inteligentes).
- `fn_financial_audit_trigger()` — trigger `AFTER INSERT/UPDATE/DELETE` em tabelas financeiras que grava em `financial_audit_logs` com hash-chain (append-only).
- `fn_log_entity_event()` — trigger auxiliar que insere em `entity_events` quando status/campos relevantes mudam (timeline de cliente/veículo/orçamento/OS).

> **Supabase Vault**: usado para armazenar credenciais sensíveis de integrações (WhatsApp, NF-e, gateways de pagamento) referenciadas por `integration_settings.credentials_secret_id` — nunca em colunas `text` simples ou `.env` versionado.

---

## 6. Modelagem do Banco de Dados

### 6.1 Domínios principais

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  profiles  │────►│   roles    │────►│ permissions │
└─────┬──────┘     └─────┬──────┘     └─────────────┘
      │                  │ role_permissions (M:N)
      │            user_permission_overrides (M:N)
      │
┌─────▼──────┐     ┌────────────┐     ┌──────────────┐
│  clients   │────►│  vehicles  │────►│ vehicle_media │
└─────┬──────┘     └─────┬──────┘     └──────────────┘
      │                  │
      │            ┌─────▼──────────┐
      │            │  appointments  │ (agenda)
      │            └────────────────┘
      │
┌─────▼──────┐     ┌──────────────┐     ┌────────────────────┐
│   quotes   │────►│ quote_items  │     │ config_categories    │
└─────┬──────┘     └──────────────┘     │ (taxonomias diversas)│
      │ conversão                        └─────────┬───────────┘
┌─────▼────────────┐  ┌────────────────────┐       │
│ service_orders    │─►│ service_order_items │◄─────┘ (services / parts)
└─────┬─────────────┘  └────────────────────┘
      │
┌─────▼─────────────────┐   ┌────────────────────┐
│ service_order_checklist│   │ service_order_status_history │
│ service_order_attachments │ service_order_time_logs        │
└────────────────────────┘   └────────────────────┘

┌────────────────────┐   ┌──────────────────────┐
│ accounts_receivable │   │ accounts_payable      │
│ + installments       │   │ + suppliers           │
└──────────┬──────────┘   └──────────┬────────────┘
           └───────────┬─────────────┘
                  ┌─────▼──────┐
                  │ cash_flow_entries │
                  └────────────┘

                ┌────────────┐
                │ audit_logs │ (registra alterações em todas as tabelas acima)
                └────────────┘
```

### 6.2 Convenções de modelagem

- PK: `id UUID DEFAULT gen_random_uuid()`.
- Timestamps: `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()` (trigger), `deleted_at TIMESTAMPTZ NULL` (soft delete).
- `created_by UUID REFERENCES profiles(id)` em tabelas operacionais (rastreabilidade).
- `organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'` — placeholder de multi-tenant futuro; índice e RLS já preparados, mas com valor único fixo na v1.
- Enums via tabelas de taxonomia (`config_categories`) em vez de `ENUM` do Postgres, exceto para estados internos estáveis (ex.: `quote_status`, `service_order_status`) onde um `CHECK` constraint com lista fixa é aceitável — porém o PRD pede que até "status" sejam configuráveis, então **status de negócio (orçamento/OS) usam `config_categories` do tipo `quote_status` / `service_order_status`** para permitir customização futura, com seed inicial dos valores padrão e `is_system = true` para impedir exclusão dos status essenciais.

---

## 7. Tabelas, Relacionamentos, Índices e RLS

> Convenção de RLS: toda tabela de negócio tem `RLS ENABLED`. Política base de leitura: `deleted_at IS NULL AND organization_id = fn_current_org_id() AND fn_has_permission('<modulo>', 'view')`. Políticas de escrita usam `create`/`edit`/`delete` respectivamente. Detalhes completos por tabela abaixo.

### 7.0 Organizações (Multi-tenant)

#### `organizations`

Tabela raiz do isolamento multi-tenant. Toda tabela de negócio referencia `organizations.id`.

| Coluna                             | Tipo                                                           | Notas                                                 |
| ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| id                                 | uuid PK                                                        |                                                       |
| name                               | text NOT NULL                                                  | razão social / nome fantasia da oficina               |
| slug                               | text UNIQUE NOT NULL                                           | identificador amigável (subdomínio futuro)            |
| document                           | text                                                           | CNPJ                                                  |
| plan                               | text DEFAULT 'free'                                            | plano SaaS futuro (free/pro/enterprise)               |
| status                             | text CHECK ('active','suspended','cancelled') DEFAULT 'active' |                                                       |
| settings                           | jsonb DEFAULT '{}'                                             | preferências gerais (logo, cores, fuso horário, etc.) |
| created_at, updated_at, deleted_at |                                                                |                                                       |

RLS: usuário autenticado só pode `SELECT`/`UPDATE` a própria organização (`id = fn_current_org_id()`), e somente com `fn_has_permission('configuracoes','edit')` para `UPDATE`. `INSERT`/`DELETE` de organizações é uma operação de plataforma (fora do RBAC normal — executada via `service_role` em onboarding, fora do escopo da v1 mas já modelada).

Seed da v1: uma única linha (`Oficina Demo` ou nome real do cliente), criada na migration inicial.

### 7.1 Núcleo: Identidade e RBAC

#### `profiles`

Espelha `auth.users` (1:1), `id` = `auth.users.id`.

| Coluna                             | Tipo                                                     | Notas                       |
| ---------------------------------- | -------------------------------------------------------- | --------------------------- |
| id                                 | uuid PK, FK auth.users                                   |                             |
| organization_id                    | uuid NOT NULL FK organizations                           | tenant do usuário           |
| full_name                          | text NOT NULL                                            |                             |
| email                              | text NOT NULL UNIQUE                                     | espelho do auth.users.email |
| phone                              | text                                                     |                             |
| avatar_url                         | text                                                     |                             |
| job_title                          | text                                                     | "Cargo"                     |
| role_id                            | uuid FK roles                                            | papel principal             |
| status                             | text CHECK in ('active','inactive') DEFAULT 'active'     |                             |
| theme_preference                   | text CHECK in ('light','dark','system') DEFAULT 'system' |                             |
| created_at, updated_at, deleted_at |                                                          |                             |

Índices: `idx_profiles_organization_id`, `idx_profiles_role_id`, `idx_profiles_status`.
RLS: usuário pode ler/atualizar o próprio perfil; leitura de todos os perfis da organização exige `fn_has_permission('usuarios','view')`; escrita exige `create/edit/delete` em `usuarios`. Toda query filtra `organization_id = fn_current_org_id()`.

#### `roles`

Papéis são **por organização** (cada tenant pode customizar nomes/permissões sem afetar outros tenants). Ao criar uma organização, os papéis padrão (`is_system = true`) são clonados a partir de um template.

| Coluna                             | Tipo                           | Notas                                                       |
| ---------------------------------- | ------------------------------ | ----------------------------------------------------------- |
| id                                 | uuid PK                        |                                                             |
| organization_id                    | uuid NOT NULL FK organizations |                                                             |
| name                               | text NOT NULL                  | ex.: Administrador, Gerente, Atendente, Técnico, Financeiro |
| description                        | text                           |                                                             |
| is_system                          | boolean DEFAULT false          | papéis protegidos (ex.: Administrador), não excluíveis      |
| created_at, updated_at, deleted_at |                                |                                                             |
|                                    |                                | `UNIQUE (organization_id, name) WHERE deleted_at IS NULL`   |

#### `permissions`

Catálogo fixo de combinações módulo×ação (seed via migration).

| Coluna                 | Tipo          | Notas                                                                                                                         |
| ---------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| id                     | uuid PK       |                                                                                                                               |
| module                 | text NOT NULL | dashboard, clientes, veiculos, agenda, orcamentos, ordens_servico, financeiro, relatorios, configuracoes, auditoria, usuarios |
| action                 | text NOT NULL | view, create, edit, delete                                                                                                    |
| UNIQUE(module, action) |               |                                                                                                                               |

#### `role_permissions`

| Coluna                         | Tipo                                   |
| ------------------------------ | -------------------------------------- | --------------------------------- |
| id                             | uuid PK                                |
| role_id                        | uuid FK roles                          |
| permission_id                  | uuid FK permissions                    |
| allowed                        | boolean DEFAULT true                   |
| scope                          | text CHECK ('all','own') DEFAULT 'all' | granularidade adicional (ver 8.5) |
| UNIQUE(role_id, permission_id) |                                        |

#### `user_permission_overrides`

Permite granularidade por usuário além do papel (ex.: "Atendente X também pode editar Financeiro").

| Coluna                         | Tipo                                   |
| ------------------------------ | -------------------------------------- | ------------------------------------------------------------------------ |
| id                             | uuid PK                                |
| user_id                        | uuid FK profiles                       |
| permission_id                  | uuid FK permissions                    |
| allowed                        | boolean                                | `true` concede, `false` revoga explicitamente, mesmo que o papel permita |
| scope                          | text CHECK ('all','own') DEFAULT 'all' |                                                                          |
| UNIQUE(user_id, permission_id) |                                        |

RLS de `roles`, `permissions`, `role_permissions`, `user_permission_overrides`: leitura exige `fn_has_permission('configuracoes','view')` (permissões geridas em Configurações); escrita exige `edit` em `configuracoes` + restrição adicional para não permitir auto-redução do próprio acesso de Administrador (validação em Server Action).

---

### 7.2 Taxonomias (Configurações Centralizadas)

#### `config_categories`

Tabela genérica para todas as listas padronizadas (ver seção 9 para detalhes de normalização).

| Coluna                             | Tipo                    | Notas                                                                                                                                                                                                                                                |
| ---------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                                 | uuid PK                 |                                                                                                                                                                                                                                                      |
| type                               | text NOT NULL           | `service_category`, `part_category`, `financial_category`, `maintenance_category`, `payment_method`, `service_type`, `cancellation_reason`, `appointment_type`, `quote_status`, `service_order_status`, `vehicle_fuel_type`, `vehicle_journey_stage` |
| name                               | text NOT NULL           | nome de exibição (case original preservado)                                                                                                                                                                                                          |
| normalized_name                    | text NOT NULL GENERATED | `fn_normalize_text(name)` — via trigger ou coluna gerada                                                                                                                                                                                             |
| color                              | text                    | usado em `StatusBadge`                                                                                                                                                                                                                               |
| icon                               | text                    | opcional                                                                                                                                                                                                                                             |
| description                        | text                    |                                                                                                                                                                                                                                                      |
| is_system                          | boolean DEFAULT false   | impede exclusão de itens essenciais (ex.: status "Cancelado")                                                                                                                                                                                        |
| is_active                          | boolean DEFAULT true    |                                                                                                                                                                                                                                                      |
| sort_order                         | int DEFAULT 0           |                                                                                                                                                                                                                                                      |
| organization_id                    | uuid DEFAULT ...        |                                                                                                                                                                                                                                                      |
| created_by                         | uuid FK profiles        |                                                                                                                                                                                                                                                      |
| created_at, updated_at, deleted_at |                         |                                                                                                                                                                                                                                                      |

Índices/Constraints:

- `UNIQUE (type, normalized_name) WHERE deleted_at IS NULL` — previne duplicidade case/espaço-insensível por tipo.
- `idx_config_categories_type_active` em `(type, is_active)`.

RLS: leitura — qualquer usuário autenticado com `view` em `configuracoes` **ou** módulos que consomem (orçamentos/OS/financeiro/agenda) podem ler itens ativos (necessário para popular selects). Escrita — `fn_has_permission('configuracoes', 'create'|'edit'|'delete')`, bloqueando exclusão se `is_system = true` ou se `usage_count > 0` (regra aplicada em função `fn_delete_config_category`).

#### `services`

Catálogo de serviços oferecidos (Pintura, Funilaria, Troca de Peça, etc. são `config_categories.type='service_category'`; `services` referencia essa categoria).

| Coluna                                                          | Tipo                                              | Notas |
| --------------------------------------------------------------- | ------------------------------------------------- | ----- |
| id                                                              | uuid PK                                           |       |
| category_id                                                     | uuid FK config_categories (type=service_category) |       |
| name                                                            | text NOT NULL                                     |       |
| normalized_name                                                 | text GENERATED                                    |       |
| description                                                     | text                                              |       |
| default_price                                                   | numeric(12,2)                                     |       |
| estimated_duration_minutes                                      | int                                               |       |
| is_active                                                       | boolean DEFAULT true                              |       |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                   |       |

`UNIQUE (category_id, normalized_name) WHERE deleted_at IS NULL`.

#### `parts`

| Coluna                                                          | Tipo                                           | Notas                                                            |
| --------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| id                                                              | uuid PK                                        |                                                                  |
| category_id                                                     | uuid FK config_categories (type=part_category) |                                                                  |
| name                                                            | text NOT NULL                                  |                                                                  |
| normalized_name                                                 | text GENERATED                                 |                                                                  |
| sku                                                             | text                                           | código interno opcional                                          |
| unit                                                            | text DEFAULT 'un'                              |                                                                  |
| default_price                                                   | numeric(12,2)                                  |                                                                  |
| stock_quantity                                                  | numeric(12,2) DEFAULT 0                        | controle simples de estoque (não é o foco do PRD, mas suportado) |
| is_active                                                       | boolean DEFAULT true                           |                                                                  |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                |                                                                  |

`UNIQUE (category_id, normalized_name) WHERE deleted_at IS NULL`.

RLS de `services`/`parts`: leitura para qualquer autenticado (necessário em selects de orçamento/OS); escrita conforme `configuracoes`.

---

### 7.3 Clientes e Veículos

#### `clients`

| Coluna                                                          | Tipo                      | Notas                                                         |
| --------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------- |
| id                                                              | uuid PK                   |                                                               |
| code                                                            | text NOT NULL             | número amigável (`CLI-000123`), via `fn_next_document_number` |
| full_name                                                       | text NOT NULL             |                                                               |
| document                                                        | text                      | CPF/CNPJ, normalizado (somente dígitos)                       |
| document_type                                                   | text CHECK ('cpf','cnpj') |                                                               |
| rg                                                              | text                      |                                                               |
| birth_date                                                      | date                      |                                                               |
| phone                                                           | text                      |                                                               |
| whatsapp                                                        | text                      |                                                               |
| email                                                           | text                      |                                                               |
| zip_code                                                        | text                      |                                                               |
| address                                                         | text                      |                                                               |
| address_number                                                  | text                      |                                                               |
| address_complement                                              | text                      |                                                               |
| neighborhood                                                    | text                      |                                                               |
| city                                                            | text                      |                                                               |
| state                                                           | char(2)                   |                                                               |
| notes                                                           | text                      |                                                               |
| organization_id, created_by, created_at, updated_at, deleted_at |                           |                                                               |

Índices: `idx_clients_full_name` (busca), `idx_clients_document` (`UNIQUE WHERE document IS NOT NULL AND deleted_at IS NULL`), `idx_clients_phone`, `UNIQUE (organization_id, code)`.
RLS: padrão por módulo `clientes`.

#### `vehicles`

| Coluna                                                          | Tipo                                               | Notas                                                         |
| --------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| id                                                              | uuid PK                                            |                                                               |
| code                                                            | text NOT NULL                                      | número amigável (`VEI-000045`), via `fn_next_document_number` |
| client_id                                                       | uuid FK clients NOT NULL                           |                                                               |
| plate                                                           | text NOT NULL                                      | normalizada uppercase, sem espaços                            |
| brand                                                           | text                                               |                                                               |
| model                                                           | text                                               |                                                               |
| year_manufacture                                                | smallint                                           |                                                               |
| year_model                                                      | smallint                                           |                                                               |
| color                                                           | text                                               |                                                               |
| renavam                                                         | text                                               |                                                               |
| chassis                                                         | text                                               |                                                               |
| fuel_type_id                                                    | uuid FK config_categories (type=vehicle_fuel_type) |                                                               |
| mileage                                                         | int                                                |                                                               |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                    |                                                               |

Índices: `idx_vehicles_client_id`, `UNIQUE (organization_id, plate) WHERE deleted_at IS NULL`, `idx_vehicles_plate_trgm` (busca fuzzy via `pg_trgm`), `UNIQUE (organization_id, code)`.
RLS: módulo `veiculos`.

#### Fotos e documentos do veículo

Armazenados em `file_metadata` (seção 7.14) com `entity_type='vehicle'` e `entity_id=vehicles.id` — não há tabela própria. RLS: módulo `veiculos` (leitura/escrita) + Storage policy baseada no prefixo `{organization_id}/vehicle/{vehicle_id}/`.

---

### 7.4 Agenda

#### `appointments`

| Coluna                                                          | Tipo                                                                             | Notas                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| id                                                              | uuid PK                                                                          |                                               |
| title                                                           | text NOT NULL                                                                    |                                               |
| appointment_type_id                                             | uuid FK config_categories (type=appointment_type)                                | Vistoria, Entrega, Retirada, Serviço, Reunião |
| client_id                                                       | uuid FK clients                                                                  | nullable                                      |
| vehicle_id                                                      | uuid FK vehicles                                                                 | nullable                                      |
| service_order_id                                                | uuid FK service_orders                                                           | nullable, vínculo opcional                    |
| assigned_to                                                     | uuid FK profiles                                                                 | responsável                                   |
| starts_at                                                       | timestamptz NOT NULL                                                             |                                               |
| ends_at                                                         | timestamptz NOT NULL                                                             |                                               |
| all_day                                                         | boolean DEFAULT false                                                            |                                               |
| location                                                        | text                                                                             |                                               |
| notes                                                           | text                                                                             |                                               |
| status                                                          | text CHECK ('scheduled','confirmed','completed','cancelled') DEFAULT 'scheduled' |                                               |
| reminder_minutes_before                                         | int                                                                              |                                               |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                                                  |                                               |

Índices: `idx_appointments_starts_at`, `idx_appointments_assigned_to`, `idx_appointments_client_id`, `idx_appointments_vehicle_id`.
RLS: módulo `agenda`. Realtime habilitado (publication).

---

### 7.4.1 Vistorias

Etapa do fluxo operacional posicionada **entre Veículo e Orçamento** (`Cliente → Veículo → Vistoria → Orçamento → ...`): registra o estado do veículo na entrada (avarias pré-existentes, km, combustível, observações) — protege a oficina e frequentemente origina o orçamento.

#### `vehicle_inspections`

| Coluna                             | Tipo                                             | Notas                                                                           |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| id                                 | uuid PK                                          |                                                                                 |
| code                               | text NOT NULL                                    | número amigável (`VIS-000012`), via `fn_next_document_number` (seção 7.10)      |
| organization_id                    | uuid NOT NULL FK organizations                   |                                                                                 |
| vehicle_id                         | uuid FK vehicles NOT NULL                        |                                                                                 |
| client_id                          | uuid FK clients NOT NULL                         |                                                                                 |
| appointment_id                     | uuid FK appointments NULL                        | se a vistoria se originou de um agendamento                                     |
| inspector_id                       | uuid FK profiles NULL                            | quem realizou                                                                   |
| inspection_date                    | timestamptz DEFAULT now()                        |                                                                                 |
| mileage                            | int                                              | km no momento da vistoria                                                       |
| fuel_level                         | text                                             | ex.: `1/4`, `1/2`, `3/4`, `cheio`                                               |
| damage_map                         | jsonb DEFAULT '[]'                               | pontos marcados em diagrama do veículo: `[{x, y, view, severity, description}]` |
| notes                              | text                                             | observações gerais, itens deixados no veículo                                   |
| status                             | text CHECK ('draft','completed') DEFAULT 'draft' |                                                                                 |
| quote_id                           | uuid FK quotes NULL                              | preenchido quando a vistoria origina um orçamento                               |
| created_by                         | uuid FK profiles                                 |                                                                                 |
| created_at, updated_at, deleted_at |                                                  |                                                                                 |

Índices: `idx_vehicle_inspections_vehicle_id`, `idx_vehicle_inspections_status`, `UNIQUE (organization_id, code)`.
RLS: novo módulo `vistorias` (view/create/edit/delete) — adicionado à matriz de permissões (seção 8.1).

#### `inspection_items`

Checklist da vistoria — segue o mesmo padrão polimórfico já usado para `service_order_checklist_items`, generalizado para reutilização futura:

| Coluna        | Tipo                                          | Notas |
| ------------- | --------------------------------------------- | ----- |
| id            | uuid PK                                       |       |
| inspection_id | uuid FK vehicle_inspections ON DELETE CASCADE |       |
| description   | text NOT NULL                                 |       |
| is_checked    | boolean DEFAULT false                         |       |
| sort_order    | int DEFAULT 0                                 |       |

RLS: herdada via `inspection_id` (módulo `vistorias`).

**Fotos**: armazenadas em `file_metadata` (seção 7.14) com `entity_type='inspection'`, `entity_id=vehicle_inspections.id`.

**Conversão para Orçamento**: ação "Gerar Orçamento a partir da Vistoria" cria um `quote` com `vehicle_id`/`client_id` pré-preenchidos e grava `vehicle_inspections.quote_id`. Itens de `quote_items` podem ser sugeridos a partir de `damage_map`/`inspection_items` (mapeamento opcional, fora do escopo do MVP).

---

### 7.4.2 Jornada do Veículo (Pátio)

Controle **físico/operacional** de "onde está o carro agora", complementar (e independente) do status comercial de `quotes`/`service_orders`. Resolve a pergunta "quantos carros estão na oficina agora" sem cruzar múltiplas tabelas.

#### `vehicle_shop_visits`

| Coluna                 | Tipo                                                   | Notas                                                                                                                  |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| id                     | uuid PK                                                |                                                                                                                        |
| organization_id        | uuid NOT NULL FK organizations                         |                                                                                                                        |
| vehicle_id             | uuid FK vehicles NOT NULL                              |                                                                                                                        |
| client_id              | uuid FK clients NOT NULL                               |                                                                                                                        |
| service_order_id       | uuid FK service_orders NULL                            | pode não existir ainda (ex.: vistoria antes da OS)                                                                     |
| inspection_id          | uuid FK vehicle_inspections NULL                       |                                                                                                                        |
| checked_in_at          | timestamptz DEFAULT now()                              | entrada física do veículo                                                                                              |
| checked_out_at         | timestamptz NULL                                       | saída física (entrega) — `NULL` = visita em aberto                                                                     |
| current_stage_id       | uuid FK config_categories (type=vehicle_journey_stage) | `aguardando_vistoria`, `em_vistoria`, `aguardando_aprovacao`, `em_execucao`, `aguardando_peca`, `pronto_para_retirada` |
| parking_spot           | text NULL                                              | opcional, ex.: "vaga 4"                                                                                                |
| created_at, updated_at |                                                        |                                                                                                                        |

Índices: `idx_vehicle_shop_visits_open` em `(organization_id, checked_out_at) WHERE checked_out_at IS NULL`, `idx_vehicle_shop_visits_vehicle_id`, `idx_vehicle_shop_visits_current_stage`.
RLS: módulo `ordens_servico` (reaproveitado — não introduz novo módulo de permissão).

- `current_stage_id` é atualizado automaticamente por triggers quando `quotes.status_id`/`service_orders.status_id` mudam (mesma engrenagem de `fn_log_entity_event`), mas também pode ser ajustado manualmente (ex.: "pronto para retirada" não corresponde a um status formal de OS).
- **Métrica derivada**: tempo de permanência (`checked_out_at - checked_in_at`) — alimenta relatórios de produtividade (Fase 10) sem esforço adicional.
- Tela `/patio` (seção 4.6.4) exibe um board por `current_stage_id`, com um card por visita em aberto.
- "Carros na oficina agora" do Dashboard Operacional (seção 4.6.3) = `COUNT(*) WHERE checked_out_at IS NULL`.

---

### 7.5 Orçamentos

#### `quotes`

| Coluna                                                          | Tipo                                          | Notas                                                                                          |
| --------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| id                                                              | uuid PK                                       |                                                                                                |
| quote_number                                                    | text NOT NULL                                 | gerado via `fn_next_document_number(org_id, 'quote')`, `UNIQUE(organization_id, quote_number)` |
| client_id                                                       | uuid FK clients NOT NULL                      |                                                                                                |
| vehicle_id                                                      | uuid FK vehicles NOT NULL                     |                                                                                                |
| status_id                                                       | uuid FK config_categories (type=quote_status) | Em elaboração, Enviado, Aprovado, Reprovado, Cancelado                                         |
| issue_date                                                      | date DEFAULT current_date                     |                                                                                                |
| valid_until                                                     | date                                          |                                                                                                |
| subtotal                                                        | numeric(12,2) DEFAULT 0                       | calculado                                                                                      |
| discount_amount                                                 | numeric(12,2) DEFAULT 0                       |                                                                                                |
| discount_percent                                                | numeric(5,2) DEFAULT 0                        |                                                                                                |
| tax_amount                                                      | numeric(12,2) DEFAULT 0                       |                                                                                                |
| total_amount                                                    | numeric(12,2) DEFAULT 0                       | calculado                                                                                      |
| notes                                                           | text                                          |                                                                                                |
| converted_to_service_order_id                                   | uuid FK service_orders                        | preenchido na conversão                                                                        |
| organization_id, created_by, created_at, updated_at, deleted_at |                                               |                                                                                                |

Índices: `idx_quotes_client_id`, `idx_quotes_vehicle_id`, `idx_quotes_status_id`, `idx_quotes_issue_date`.
RLS: módulo `orcamentos`.

#### `quote_items`

| Coluna                 | Tipo                                      | Notas                                                                            |
| ---------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |
| id                     | uuid PK                                   |                                                                                  |
| quote_id               | uuid FK quotes NOT NULL ON DELETE CASCADE |                                                                                  |
| item_type              | text CHECK ('service','part','custom')    |                                                                                  |
| service_id             | uuid FK services NULL                     |                                                                                  |
| part_id                | uuid FK parts NULL                        |                                                                                  |
| category_id            | uuid FK config_categories NULL            | categoria selecionada (multi-categoria por orçamento decorre de múltiplos itens) |
| description            | text NOT NULL                             | nome/descrição do item (copiado no momento, permite custom)                      |
| quantity               | numeric(12,2) DEFAULT 1                   |                                                                                  |
| unit_price             | numeric(12,2) NOT NULL                    |                                                                                  |
| discount_amount        | numeric(12,2) DEFAULT 0                   |                                                                                  |
| total_amount           | numeric(12,2) GENERATED                   | `(quantity*unit_price) - discount_amount`                                        |
| sort_order             | int DEFAULT 0                             |                                                                                  |
| created_at, updated_at |                                           |                                                                                  |

Índice: `idx_quote_items_quote_id`.
RLS: herdada via `quote_id` (policy verifica permissão em `orcamentos`).

Trigger: recalcula `quotes.subtotal/total_amount` ao alterar itens (`fn_recalc_quote_totals`).

---

### 7.6 Ordens de Serviço

#### `service_orders`

| Coluna                                                          | Tipo                                                      | Notas                                                                                               |
| --------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| id                                                              | uuid PK                                                   |                                                                                                     |
| os_number                                                       | text NOT NULL                                             | gerado via `fn_next_document_number(org_id, 'service_order')`, `UNIQUE(organization_id, os_number)` |
| quote_id                                                        | uuid FK quotes NULL                                       | origem (se convertida)                                                                              |
| client_id                                                       | uuid FK clients NOT NULL                                  |                                                                                                     |
| vehicle_id                                                      | uuid FK vehicles NOT NULL                                 |                                                                                                     |
| status_id                                                       | uuid FK config_categories (type=service_order_status)     | Aberta, Em Andamento, Aguardando Peça, Pausada, Concluída, Entregue, Cancelada                      |
| assigned_to                                                     | uuid FK profiles NULL                                     | técnico responsável                                                                                 |
| entry_date                                                      | timestamptz DEFAULT now()                                 | entrada                                                                                             |
| expected_delivery_date                                          | timestamptz                                               |                                                                                                     |
| started_at                                                      | timestamptz                                               |                                                                                                     |
| completed_at                                                    | timestamptz                                               |                                                                                                     |
| delivered_at                                                    | timestamptz                                               |                                                                                                     |
| cancellation_reason_id                                          | uuid FK config_categories (type=cancellation_reason) NULL |                                                                                                     |
| subtotal, discount_amount, tax_amount, total_amount             | numeric(12,2)                                             | mesma lógica de quotes                                                                              |
| notes                                                           | text                                                      |                                                                                                     |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                           |                                                                                                     |

Índices: `idx_service_orders_client_id`, `idx_service_orders_vehicle_id`, `idx_service_orders_status_id`, `idx_service_orders_assigned_to`, `idx_service_orders_entry_date`.
RLS: módulo `ordens_servico`.

#### `service_order_items`

Mesma estrutura de `quote_items`, vinculada a `service_order_id`.

| Coluna                                              | Tipo                                     |
| --------------------------------------------------- | ---------------------------------------- |
| id                                                  | uuid PK                                  |
| service_order_id                                    | uuid FK service_orders ON DELETE CASCADE |
| item_type                                           | text CHECK ('service','part','custom')   |
| service_id / part_id / category_id                  | uuid FK (nullable)                       |
| description                                         | text                                     |
| quantity, unit_price, discount_amount, total_amount | numeric(12,2)                            |
| sort_order                                          | int                                      |
| created_at, updated_at                              |                                          |

#### `service_order_checklist_items`

| Coluna           | Tipo                                     | Notas |
| ---------------- | ---------------------------------------- | ----- |
| id               | uuid PK                                  |       |
| service_order_id | uuid FK service_orders ON DELETE CASCADE |       |
| description      | text NOT NULL                            |       |
| is_completed     | boolean DEFAULT false                    |       |
| completed_by     | uuid FK profiles                         |       |
| completed_at     | timestamptz                              |       |
| sort_order       | int                                      |       |

#### Fotos e anexos da OS (antes/depois, laudos)

Armazenados em `file_metadata` (seção 7.14) com `entity_type='service_order'` e `entity_id=service_orders.id`, usando `attachment_type` (`photo_before`, `photo_after`, `document`, `other`).

#### `service_order_status_history`

Histórico de mudanças de status (parte da auditoria de domínio, além do `audit_logs` genérico — facilita timeline na UI).

| Coluna           | Tipo                                     |
| ---------------- | ---------------------------------------- |
| id               | uuid PK                                  |
| service_order_id | uuid FK service_orders ON DELETE CASCADE |
| from_status_id   | uuid FK config_categories NULL           |
| to_status_id     | uuid FK config_categories NOT NULL       |
| changed_by       | uuid FK profiles                         |
| notes            | text                                     |
| created_at       | timestamptz DEFAULT now()                |

#### `service_order_time_logs`

Controle de tempo (apontamento de horas por técnico).

| Coluna           | Tipo                                       |
| ---------------- | ------------------------------------------ |
| id               | uuid PK                                    |
| service_order_id | uuid FK service_orders ON DELETE CASCADE   |
| user_id          | uuid FK profiles                           |
| started_at       | timestamptz NOT NULL                       |
| ended_at         | timestamptz NULL                           |
| duration_minutes | int GENERATED (quando ended_at preenchido) |
| notes            | text                                       |

RLS de todas as tabelas `service_order_*`: herdam permissão de `ordens_servico` via `service_order_id`.

---

### 7.7 Financeiro

#### `suppliers`

| Coluna                                                          | Tipo          |
| --------------------------------------------------------------- | ------------- |
| id                                                              | uuid PK       |
| name                                                            | text NOT NULL |
| document                                                        | text          |
| phone, email, address                                           | text          |
| organization_id, created_by, created_at, updated_at, deleted_at |               |

#### `payment_methods`

> Implementado como `config_categories.type='payment_method'` (ver seção 9) — não é tabela própria.

#### `accounts_receivable`

| Coluna                                                          | Tipo                                                                                   | Notas  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------ |
| id                                                              | uuid PK                                                                                |        |
| service_order_id                                                | uuid FK service_orders NULL                                                            | origem |
| client_id                                                       | uuid FK clients NOT NULL                                                               |        |
| category_id                                                     | uuid FK config_categories (type=financial_category)                                    |        |
| description                                                     | text NOT NULL                                                                          |        |
| total_amount                                                    | numeric(12,2) NOT NULL                                                                 |        |
| issue_date                                                      | date DEFAULT current_date                                                              |        |
| due_date                                                        | date                                                                                   |        |
| status                                                          | text CHECK ('pending','partially_paid','paid','overdue','cancelled') DEFAULT 'pending' |        |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                                                        |        |

#### `accounts_receivable_installments`

| Coluna                 | Tipo                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| id                     | uuid PK                                                               |
| accounts_receivable_id | uuid FK accounts_receivable ON DELETE CASCADE                         |
| installment_number     | int                                                                   |
| amount                 | numeric(12,2)                                                         |
| due_date               | date                                                                  |
| paid_at                | timestamptz NULL                                                      |
| paid_amount            | numeric(12,2) NULL                                                    |
| payment_method_id      | uuid FK config_categories (type=payment_method) NULL                  |
| status                 | text CHECK ('pending','paid','overdue','cancelled') DEFAULT 'pending' |

#### `accounts_payable`

| Coluna                                                          | Tipo                                                                                   | Notas |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----- |
| id                                                              | uuid PK                                                                                |       |
| supplier_id                                                     | uuid FK suppliers NULL                                                                 |       |
| category_id                                                     | uuid FK config_categories (type=financial_category)                                    |       |
| description                                                     | text NOT NULL                                                                          |       |
| total_amount                                                    | numeric(12,2) NOT NULL                                                                 |       |
| issue_date                                                      | date                                                                                   |       |
| due_date                                                        | date                                                                                   |       |
| status                                                          | text CHECK ('pending','partially_paid','paid','overdue','cancelled') DEFAULT 'pending' |       |
| organization_id, created_by, created_at, updated_at, deleted_at |                                                                                        |       |

#### `accounts_payable_installments`

Estrutura espelhada de `accounts_receivable_installments` (sem `payment_method` opcionalmente).

#### `cash_flow_entries`

View materializada/lógica (ou tabela populada via trigger) consolidando entradas (recebimentos) e saídas (pagamentos) para o módulo Fluxo de Caixa e DRE.

| Coluna                      | Tipo                                                | Notas                                                                |
| --------------------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| id                          | uuid PK                                             |                                                                      |
| entry_type                  | text CHECK ('income','expense')                     |                                                                      |
| reference_table             | text                                                | `accounts_receivable_installments` / `accounts_payable_installments` |
| reference_id                | uuid                                                |                                                                      |
| category_id                 | uuid FK config_categories (type=financial_category) |                                                                      |
| amount                      | numeric(12,2)                                       |                                                                      |
| entry_date                  | date                                                | data do recebimento/pagamento efetivo                                |
| organization_id, created_at |                                                     |                                                                      |

> Alternativa avaliada: gerar `cash_flow_entries` via `VIEW` (sem armazenamento) unindo as duas tabelas de parcelas pagas. Recomenda-se **VIEW** para evitar duplicação/discrepância — manter como tabela física apenas se houver necessidade de lançamentos manuais avulsos (ex.: aporte de sócio). Decisão final na Fase 7 do roadmap.

Índices: `idx_accounts_receivable_client_id`, `idx_accounts_receivable_status`, `idx_ar_installments_due_date`, `idx_accounts_payable_supplier_id`, `idx_ap_installments_due_date`.
RLS: módulo `financeiro`.

---

### 7.8 Auditoria

#### `audit_logs`

| Coluna     | Tipo                                                     | Notas                                     |
| ---------- | -------------------------------------------------------- | ----------------------------------------- |
| id         | uuid PK                                                  |                                           |
| user_id    | uuid FK profiles NULL                                    | quem executou (null = sistema)            |
| user_email | text                                                     | snapshot, sobrevive a exclusão de usuário |
| ip_address | inet                                                     | capturado via header (Edge/Server Action) |
| module     | text NOT NULL                                            | tabela/módulo afetado                     |
| entity_id  | uuid                                                     | id do registro afetado                    |
| action     | text CHECK ('login','logout','create','update','delete') |                                           |
| changes    | jsonb                                                    | diff `{ field: { old, new } }`            |
| created_at | timestamptz DEFAULT now()                                |                                           |

Índices: `idx_audit_logs_user_id`, `idx_audit_logs_module`, `idx_audit_logs_created_at`, `idx_audit_logs_entity_id`.
RLS: leitura exige `fn_has_permission('auditoria','view')`. **Sem update/delete permitidos a nenhum papel** (append-only; até Administrador só lê).

Eventos de `login`/`logout` são inseridos via Server Action chamada no callback de auth state change (capturando IP via `headers()`).

---

### 7.9 Visão consolidada de RLS (padrão por módulo)

Para cada tabela operacional `T` pertencente ao módulo `M`:

```sql
-- SELECT
CREATE POLICY "select_T" ON T FOR SELECT
USING (
  deleted_at IS NULL
  AND organization_id = fn_current_org_id()
  AND fn_has_permission('M','view')
);

-- INSERT
CREATE POLICY "insert_T" ON T FOR INSERT
WITH CHECK (
  organization_id = fn_current_org_id()
  AND fn_has_permission('M','create')
);

-- UPDATE
CREATE POLICY "update_T" ON T FOR UPDATE
USING (deleted_at IS NULL AND organization_id = fn_current_org_id() AND fn_has_permission('M','edit'))
WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission('M','edit'));

-- DELETE (soft delete via UPDATE deleted_at, mas policy de DELETE físico bloqueada)
CREATE POLICY "delete_T" ON T FOR DELETE
USING (false); -- exclusão física desabilitada; soft delete = UPDATE com permissão 'delete'
```

> Soft delete é implementado como `UPDATE ... SET deleted_at = now()`, autorizado por uma policy de UPDATE adicional que checa `fn_has_permission('M','delete')` quando a única alteração é `deleted_at`. Isso evita duplicar lógica de UPDATE — será detalhado na migration correspondente.

`fn_current_org_id()` / `fn_current_role_id()`:

```sql
-- Funções STABLE, leem claims injetados pelo Auth Hook (ver seção 5.1)
fn_current_org_id()  -> (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid
fn_current_role_id() -> (auth.jwt() -> 'app_metadata' ->> 'role_id')::uuid
```

`fn_has_permission(p_module text, p_action text)`:

```sql
-- Pseudocódigo da função STABLE
1. role_id = fn_current_role_id()
2. user_id = auth.uid()
3. resultado_role = existe role_permissions com (role_id, permission(module,action), allowed=true)
4. override = existe user_permission_overrides com (user_id, permission(module,action))
5. se override existe -> retorna override.allowed
6. senão -> retorna resultado_role
```

> **Por que claims no JWT em vez de subquery em `profiles`/`roles` a cada policy?** Em volume alto (milhares de linhas avaliadas por query), uma subquery por linha em `profiles`/`role_permissions` degrada performance. Os claims (`organization_id`, `role_id`) são fixados no token e só mudam em login/refresh ou quando um admin altera o papel do usuário (nesse caso, força-se um refresh de sessão). `fn_has_permission` ainda consulta `role_permissions`/`user_permission_overrides`, mas filtrando por `role_id`/`user_id` já conhecidos (via JWT), com índices dedicados — sem precisar resolver `profiles` primeiro.

---

### 7.10 Numeração Amigável (Document Numbers)

UUIDs não são amigáveis para usuários (atendentes, clientes em conversas de WhatsApp, impressões). Para `quotes`, `service_orders`, `clients` e `vehicles`, é gerado um **código sequencial por organização**, além do `id` (uuid).

#### `document_sequences`

| Coluna          | Tipo                           | Notas                                                                                           |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| id              | uuid PK                        |                                                                                                 |
| organization_id | uuid NOT NULL FK organizations |                                                                                                 |
| entity_type     | text NOT NULL                  | `quote`, `service_order`, `client`, `vehicle`                                                   |
| year            | int NULL                       | usado para sequências anuais (orçamento/OS); `NULL` para sequências contínuas (cliente/veículo) |
| prefix          | text NOT NULL                  | `ORC`, `OS`, `CLI`, `VEI`                                                                       |
| last_number     | bigint NOT NULL DEFAULT 0      |                                                                                                 |
|                 |                                | `UNIQUE (organization_id, entity_type, year)`                                                   |

`fn_next_document_number(p_org uuid, p_entity_type text)`:

```sql
-- SECURITY DEFINER, executa dentro da transação do INSERT
1. SELECT ... FOR UPDATE na linha (organization_id, entity_type, year_atual_ou_null)
   -- cria a linha se não existir (ano novo ou primeira vez)
2. UPDATE last_number = last_number + 1
3. retorna formatado: prefix || '-' || [year || '-' ] || lpad(last_number, 6, '0')
   -- ex.: 'ORC-2026-000123', 'CLI-000045'
```

Aplicação:

- `quotes.quote_number` e `service_orders.os_number` (já previstos) passam a ser gerados por esta função (substituindo a referência genérica anterior a `fn_generate_document_number`).
- `clients.code` e `vehicles.code` (novas colunas `text UNIQUE` por organização) seguem o mesmo mecanismo, gerados via trigger `BEFORE INSERT`.
- O lock `FOR UPDATE` é por linha de `document_sequences` (granularidade por organização+tipo), evitando contenção entre tenants e entre módulos diferentes.

### 7.11 Timeline de Eventos por Entidade

Tabela genérica para o **histórico de negócio** (visível ao usuário), distinta de `audit_logs` (técnico/forense). Atende ao requisito de timeline por cliente, veículo, orçamento e OS.

#### `entity_events`

| Coluna          | Tipo                           | Notas                                                                                                                            |
| --------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| id              | uuid PK                        |                                                                                                                                  |
| organization_id | uuid NOT NULL FK organizations |                                                                                                                                  |
| entity_type     | text NOT NULL                  | `client`, `vehicle`, `quote`, `service_order`                                                                                    |
| entity_id       | uuid NOT NULL                  |                                                                                                                                  |
| event_type      | text NOT NULL                  | `created`, `status_changed`, `note_added`, `file_uploaded`, `appointment_scheduled`, `payment_received`, `converted_to_os`, etc. |
| title           | text NOT NULL                  | resumo curto exibido na timeline                                                                                                 |
| description     | text                           |                                                                                                                                  |
| metadata        | jsonb DEFAULT '{}'             | dados estruturados (ex.: `{from_status, to_status}`)                                                                             |
| created_by      | uuid FK profiles NULL          | `NULL` = evento gerado pelo sistema                                                                                              |
| created_at      | timestamptz DEFAULT now()      |                                                                                                                                  |

Índice: `idx_entity_events_lookup` em `(organization_id, entity_type, entity_id, created_at DESC)` — cobre a query principal da timeline.

Populada por:

- Triggers automáticos em mudanças de status (`quotes.status_id`, `service_orders.status_id` → `service_order_status_history` já existente alimenta `entity_events` também via `fn_log_entity_event`).
- Inserções manuais (ex.: "adicionar observação ao histórico do cliente") via Server Action.

RLS: segue a permissão do módulo correspondente ao `entity_type` (ex.: `entity_type='client'` exige `clientes.view`), validada via `CASE` dentro de `fn_has_permission` ou policy específica `fn_has_permission_for_entity(entity_type, 'view')`.

#### 7.11.1 Espelhamento para a Timeline Completa do Veículo

O PRD exige uma **linha do tempo completa do veículo** — todos os eventos de vistorias, orçamentos, OS e agendamentos relacionados àquele `vehicle_id`, em ordem cronológica única, não apenas eventos gravados diretamente com `entity_type='vehicle'`.

**Decisão**: `fn_log_entity_event()` passa a, **adicionalmente**, gravar uma cópia (espelho) do evento com `entity_type='vehicle', entity_id=<vehicle_id>` sempre que o evento original pertencer a uma entidade que possua `vehicle_id` (`vehicle_inspections`, `quotes`, `service_orders`, `appointments`). O registro espelhado preserva a origem em `metadata`:

```json
{
  "source_entity_type": "service_order",
  "source_entity_id": "<uuid da OS>"
}
```

- **Vantagem**: a tela de Veículo consulta apenas `idx_entity_events_lookup (organization_id, entity_type='vehicle', entity_id, created_at DESC)` — já existente, sem joins e compatível com paginação por cursor (seção 10.1).
- **Custo**: leve duplicação de linhas, aceitável dado que `entity_events` já é particionada mensalmente (seção 10.1).
- `TimelinePanel` (seção 4.4) exibe um ícone/label de origem (📋 Orçamento, 🔧 OS, 🔍 Vistoria, 📅 Agendamento) para cada item espelhado, com link para o registro original.
- Implementação prevista junto aos triggers de `quotes`/`service_orders` (Fases 6–7) e `vehicle_inspections` (Fase 5.5) — sem nova tabela.

### 7.12 Notificações Internas

#### `notifications`

| Coluna          | Tipo                           | Notas                                                                                                            |
| --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| id              | uuid PK                        |                                                                                                                  |
| organization_id | uuid NOT NULL FK organizations |                                                                                                                  |
| user_id         | uuid NOT NULL FK profiles      | destinatário                                                                                                     |
| type            | text NOT NULL                  | `appointment_reminder`, `os_status_changed`, `quote_approved`, `payment_due`, `payment_overdue`, `mention`, etc. |
| title           | text NOT NULL                  |                                                                                                                  |
| message         | text                           |                                                                                                                  |
| link            | text                           | rota interna (ex.: `/ordens-servico/{id}`)                                                                       |
| metadata        | jsonb DEFAULT '{}'             |                                                                                                                  |
| read_at         | timestamptz NULL               |                                                                                                                  |
| created_at      | timestamptz DEFAULT now()      |                                                                                                                  |

Índice: `idx_notifications_user_unread` em `(user_id, read_at) WHERE read_at IS NULL`.

#### `notification_preferences`

| Coluna            | Tipo                                     | Notas                                         |
| ----------------- | ---------------------------------------- | --------------------------------------------- |
| id                | uuid PK                                  |                                               |
| user_id           | uuid NOT NULL FK profiles                |                                               |
| notification_type | text NOT NULL                            | mesmo domínio de `notifications.type`         |
| channel           | text CHECK ('in_app','email','whatsapp') |                                               |
| enabled           | boolean DEFAULT true                     |                                               |
|                   |                                          | `UNIQUE(user_id, notification_type, channel)` |

RLS: usuário só lê/atualiza suas próprias notificações e preferências (`user_id = auth.uid()`); inserção feita por triggers/Server Actions do sistema (`SECURITY DEFINER`).

Realtime habilitado em `notifications` (canal por `user_id`) para o sino de notificações no topbar. O canal `channel='whatsapp'` fica reservado para a Fase de integrações (7.15) — disparo via Edge Function.

### 7.13 Auditoria Financeira Imutável

Requisito crítico: alterações em tabelas financeiras precisam de trilha **append-only e à prova de adulteração**, separada de `audit_logs` (que é genérica e, em tese, poderia ser limpa por um super-admin).

#### `financial_audit_logs`

| Coluna          | Tipo                                             | Notas                                                                                                                |
| --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --- | ----------------------------------------------- |
| id              | uuid PK                                          |                                                                                                                      |
| organization_id | uuid NOT NULL FK organizations                   |                                                                                                                      |
| table_name      | text NOT NULL                                    | `accounts_receivable`, `accounts_receivable_installments`, `accounts_payable`, `accounts_payable_installments`, etc. |
| record_id       | uuid NOT NULL                                    |                                                                                                                      |
| action          | text CHECK ('insert','update','delete') NOT NULL |                                                                                                                      |
| changed_by      | uuid FK profiles NULL                            |                                                                                                                      |
| changed_at      | timestamptz DEFAULT now()                        |                                                                                                                      |
| old_data        | jsonb                                            | snapshot completo antes (NULL em insert)                                                                             |
| new_data        | jsonb                                            | snapshot completo depois (NULL em delete)                                                                            |
| previous_hash   | text NOT NULL                                    | hash do registro anterior da mesma organização                                                                       |
| record_hash     | text NOT NULL                                    | `sha256(previous_hash                                                                                                |     | serialização determinística do registro atual)` |

Garantias:

- `fn_financial_audit_trigger()` aplicado via `AFTER INSERT/UPDATE/DELETE` em todas as tabelas de `accounts_receivable*`, `accounts_payable*`.
- `REVOKE UPDATE, DELETE ON financial_audit_logs FROM PUBLIC, authenticated, service_role` (exceto o próprio trigger via `SECURITY DEFINER`/owner) — **nenhum papel, incluindo Administrador, pode alterar ou apagar registros** pela API.
- Hash-chain por organização permite detectar adulteração: recalcular a cadeia e comparar com `record_hash` armazenado.
- Índices: `idx_financial_audit_org_table_record` em `(organization_id, table_name, record_id, changed_at)`.

RLS: `SELECT` exige `fn_has_permission('auditoria','view')`; sem policies de `INSERT`/`UPDATE`/`DELETE` para roles de aplicação (somente o trigger, executado como owner do banco, grava).

### 7.14 Arquivos e Mídia (Storage)

Para evitar tabelas duplicadas (`vehicle_media`, `service_order_attachments`, anexos de orçamento, avatares) e centralizar controle de uso de storage por tenant (importante para limites de plano SaaS), adota-se uma **tabela genérica única**:

#### `file_metadata`

| Coluna                 | Tipo                           | Notas                                                                                                                     |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| id                     | uuid PK                        |                                                                                                                           |
| organization_id        | uuid NOT NULL FK organizations |                                                                                                                           |
| bucket                 | text NOT NULL                  | `vehicle-photos`, `vehicle-documents`, `service-order-attachments`, `quote-attachments`, `avatars`, `generated-pdfs`      |
| file_path              | text NOT NULL                  | path completo no bucket                                                                                                   |
| file_name              | text NOT NULL                  | nome original                                                                                                             |
| mime_type              | text                           |                                                                                                                           |
| size_bytes             | bigint                         |                                                                                                                           |
| entity_type            | text NOT NULL                  | `vehicle`, `service_order`, `quote`, `client`, `profile`                                                                  |
| entity_id              | uuid NOT NULL                  |                                                                                                                           |
| attachment_type        | text                           | `photo`, `document`, `photo_before`, `photo_after`, `other` (substitui o CHECK específico de `service_order_attachments`) |
| description            | text                           |                                                                                                                           |
| uploaded_by            | uuid FK profiles               |                                                                                                                           |
| created_at, deleted_at |                                |                                                                                                                           |

Índice: `idx_file_metadata_entity` em `(organization_id, entity_type, entity_id)`.

> **Decisão**: as tabelas `vehicle_media` e `service_order_attachments` descritas nas seções 7.3 e 7.6 são **substituídas** por `file_metadata` (mesma finalidade, modelo polimórfico único). Isso simplifica RLS de Storage (uma única policy genérica baseada em `entity_type`/`entity_id` + permissão do módulo correspondente) e dá uma visão consolidada de "quanto storage cada organização está usando" (`SUM(size_bytes) GROUP BY organization_id`), útil para cobrança/planos futuros.

Convenção de path no Storage: `{bucket}/{organization_id}/{entity_type}/{entity_id}/{uuid}-{filename}` — o prefixo `organization_id` permite policies de Storage baseadas em `storage.foldername(name)` sem necessidade de joins.

### 7.15 Integrações Futuras (Stubs de Modelagem)

Modelados agora para evitar retrabalho estrutural, **implementação adiada para fase pós-MVP** (seção 11, Fase 13).

#### `integration_settings`

Configuração de integrações por organização (WhatsApp, NF-e/NFS-e, gateways de pagamento).

| Coluna                 | Tipo                           | Notas                                                                                                                      |
| ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| id                     | uuid PK                        |                                                                                                                            |
| organization_id        | uuid NOT NULL FK organizations |                                                                                                                            |
| provider               | text NOT NULL                  | `whatsapp_evolution`, `whatsapp_meta_cloud`, `nfe_focus`, `nfse_ginfes` (exemplo), `payment_stripe`, `payment_mercadopago` |
| config                 | jsonb DEFAULT '{}'             | parâmetros não sensíveis (URLs, IDs públicos)                                                                              |
| credentials_secret_id  | text                           | referência a um segredo no **Supabase Vault** (nunca a credencial em si)                                                   |
| is_active              | boolean DEFAULT false          |                                                                                                                            |
| created_at, updated_at |                                |                                                                                                                            |
|                        |                                | `UNIQUE(organization_id, provider)`                                                                                        |

#### WhatsApp (`whatsapp_conversations`, `whatsapp_messages`)

| Tabela                   | Colunas principais                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `whatsapp_conversations` | `id, organization_id, client_id (FK clients), phone_number, last_message_at, created_at`                        |
| `whatsapp_messages`      | `id, conversation_id (FK), direction CHECK('in','out'), message_type, content, status, external_id, created_at` |

Uso futuro: notificações de agendamento/OS/cobrança via `notifications.channel='whatsapp'` disparam Edge Function que usa `integration_settings` (Evolution API ou Meta Cloud API) e registra em `whatsapp_messages`.

#### NF-e / NFS-e (`fiscal_documents`)

| Coluna                 | Tipo                           | Notas                                               |
| ---------------------- | ------------------------------ | --------------------------------------------------- |
| id                     | uuid PK                        |                                                     |
| organization_id        | uuid NOT NULL FK organizations |                                                     |
| document_type          | text CHECK ('nfe','nfse')      |                                                     |
| reference_table        | text                           | `service_orders` ou `accounts_receivable`           |
| reference_id           | uuid                           |                                                     |
| status                 | text                           | `pending`, `issued`, `cancelled`, `error`           |
| access_key             | text                           | chave de acesso da nota                             |
| xml_url                | text                           | path em `file_metadata`/Storage                     |
| pdf_url                | text                           |                                                     |
| issued_at              | timestamptz                    |                                                     |
| provider_response      | jsonb                          | payload bruto do provedor (Focus NFe, eNotas, etc.) |
| created_at, updated_at |                                |                                                     |

#### Gateways de Pagamento (`payment_transactions`)

| Coluna                             | Tipo                                     | Notas                                      |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------ |
| id                                 | uuid PK                                  |                                            |
| organization_id                    | uuid NOT NULL FK organizations           |                                            |
| accounts_receivable_installment_id | uuid FK accounts_receivable_installments |                                            |
| gateway                            | text                                     | `stripe`, `mercadopago`, `pagseguro`, etc. |
| external_id                        | text                                     | id da transação no gateway                 |
| status                             | text                                     | `pending`, `paid`, `failed`, `refunded`    |
| amount                             | numeric(12,2)                            |                                            |
| payload                            | jsonb                                    | webhook bruto                              |
| created_at, updated_at             |                                          |                                            |

Quando uma `payment_transaction` muda para `paid`, trigger atualiza `accounts_receivable_installments.status/paid_at/paid_amount` (mesma trilha de `financial_audit_logs`).

RLS de todas as tabelas desta seção: módulo `financeiro` (pagamentos/fiscal) ou `configuracoes` (`integration_settings`), com `organization_id = fn_current_org_id()`.

---

## 8. Sistema RBAC de Permissões

### 8.1 Modelo

- **Papéis (roles)**: configuráveis, com seed inicial: `Administrador` (is_system, todas permissões), `Gerente`, `Atendente`, `Técnico`, `Financeiro`. Novos papéis podem ser criados em Configurações.
- **Permissões (permissions)**: matriz fixa **Módulo × Ação**, seedada via migration:

| Módulo         | view | create | edit | delete |
| -------------- | ---- | ------ | ---- | ------ |
| dashboard      | ✅   | –      | –    | –      |
| clientes       | ✅   | ✅     | ✅   | ✅     |
| veiculos       | ✅   | ✅     | ✅   | ✅     |
| vistorias      | ✅   | ✅     | ✅   | ✅     |
| agenda         | ✅   | ✅     | ✅   | ✅     |
| orcamentos     | ✅   | ✅     | ✅   | ✅     |
| ordens_servico | ✅   | ✅     | ✅   | ✅     |
| financeiro     | ✅   | ✅     | ✅   | ✅     |
| relatorios     | ✅   | –      | –    | –      |
| configuracoes  | ✅   | ✅     | ✅   | ✅     |
| auditoria      | ✅   | –      | –    | –      |
| usuarios       | ✅   | ✅     | ✅   | ✅     |

(`dashboard`, `relatorios`, `auditoria` não possuem create/edit/delete — apenas `view`. O Pátio (`/patio`) não introduz módulo próprio — reutiliza a permissão `ordens_servico`, conforme 7.4.2.)

- **role_permissions**: define o conjunto padrão por papel (ex.: `Atendente` tem `orcamentos.create=true`, `financeiro.edit=false`).
- **user_permission_overrides**: ajustes pontuais por usuário, conforme exemplo do PRD ("ver Financeiro mas não editar; criar Orçamentos mas não excluir") — mesmo que o papel do usuário não preveja, o override individual prevalece.

### 8.2 Resolução de permissão efetiva

```
permissão_efetiva(usuário, módulo, ação) =
   override_usuário(usuário, módulo, ação)  -- se existir, vence
   OU role_permission(papel_do_usuário, módulo, ação)  -- senão
   OU false  -- padrão seguro
```

### 8.3 Aplicação

- **Backend**: `fn_has_permission` usada em todas as policies RLS.
- **Frontend**:
  - No login, Server Action monta um "mapa de permissões efetivas" (`{ [module]: { view, create, edit, delete } }`) e injeta no contexto da sessão (cookie assinado curto ou recalculado a cada navegação via Server Component).
  - `middleware.ts` valida `view` por rota.
  - `<PermissionGate>` valida `create/edit/delete` em botões/ações.
- **UI de Configurações > Permissões**: matriz visual (papéis × módulos × ações) com toggles, mais uma seção "Permissões individuais" por usuário (overrides).

### 8.4 Regras especiais

- Papel `Administrador` (`is_system=true`) não pode ser excluído nem ter `usuarios.*` revogado abaixo de um mínimo (garante que sempre exista quem gerencia usuários).
- Usuário não pode revogar `usuarios.edit`/`delete` de si mesmo se for o único Administrador ativo (checado em Server Action antes do update).

### 8.5 Dimensão `scope` (own/all) — extensibilidade futura

A coluna `scope` em `role_permissions`/`user_permission_overrides` (`'all'` por padrão) prepara o RBAC para regras do tipo **"Técnico só vê/edita as próprias OS"** ou **"Vendedor só vê os próprios orçamentos"**, sem exigir nova migração estrutural quando esse requisito surgir:

- `scope='all'` (padrão atual): comportamento já documentado na seção 7.9 — sem filtro adicional.
- `scope='own'`: quando `fn_has_permission` retornar esse escopo para `(role/user, module, action)`, a policy de RLS da tabela correspondente adiciona `AND assigned_to = auth.uid()` (ou `created_by = auth.uid()`, conforme a tabela — ex.: `service_orders.assigned_to`, `quotes.created_by`).
- Nenhuma policy `'own'` é ativada na v1 (todos os papéis seed usam `scope='all'`); a coluna existe apenas para que a Fase de RBAC avançado (pós-MVP) não exija alterar `role_permissions`/`user_permission_overrides` nem recriar policies do zero — apenas adicionar a cláusula condicional.

---

## 9. Padronização Global / Sistema de Taxonomias

Implementa os requisitos de "Categorias de Serviços", "Categorias Financeiras", "Categorias de Peças", "Status", "Formas de Pagamento", "Motivos de Cancelamento", "Tipos de Agendamento" etc. de forma **unificada**, evitando 10 tabelas quase idênticas.

### 9.1 Tabela única `config_categories`

- Campo `type` discrimina a finalidade (enum textual controlado por constraint `CHECK` + lista em `lib/constants`).
- `normalized_name` (coluna gerada, `lower(unaccent(trim(name)))`) garante que **"Pintura"**, **"pintura"**, **"PINTURA "** sejam tratados como duplicados via `UNIQUE(type, normalized_name)`.
- Extensão `unaccent` habilitada na migration `0001_init_extensions.sql` (junto com `pgcrypto` para `gen_random_uuid()` e `pg_trgm` para busca).

### 9.2 Validação em 3 camadas (anti-duplicidade)

1. **Frontend**: ao digitar, debounce + chamada `RPC fn_check_category_duplicate(type, name)` exibe aviso "Já existe uma categoria semelhante: Pintura".
2. **Backend (Server Action)**: revalida antes do insert.
3. **Banco**: `UNIQUE (type, normalized_name) WHERE deleted_at IS NULL` — garante consistência mesmo sob concorrência.

### 9.3 Contadores inteligentes (`usage_count`)

- Coluna `usage_count int DEFAULT 0` em `config_categories`, `services`, `parts`.
- Trigger `fn_increment_taxonomy_usage` em `quote_items` / `service_order_items` (e demais tabelas que referenciam `category_id`/`service_id`/`part_id`/`status_id`/`payment_method_id`/etc.) incrementa/decrementa `usage_count` em `INSERT`/`DELETE`/`UPDATE` que troque a referência.
- Exclusão de uma categoria com `usage_count > 0` é bloqueada (mensagem: "Esta categoria possui N itens vinculados e não pode ser excluída — desative-a em vez disso").

### 9.4 Cadastro rápido ("Quick Create")

- Componente `QuickCreateDialog` reutilizável: recebe `type` (ex.: `service_category`) e callback `onCreated(item)`.
- Fluxo: usuário digita nome inexistente no `ComboboxAsync` → opção "Criar nova categoria '<texto>'" → abre `QuickCreateDialog` pré-preenchido → `RPC`/Server Action valida e insere em `config_categories` (ou `services`/`parts`) → retorna o registro criado → combobox atualiza cache (TanStack Query `setQueryData`) e seleciona automaticamente o novo item.

### 9.5 Multi-seleção de Serviços/Categorias em Orçamento e OS

- `quote_items`/`service_order_items` já suportam múltiplas linhas, cada uma com seu `category_id`/`service_id` — portanto "múltiplas categorias e múltiplos serviços" é resolvido naturalmente pela lista de itens.
- Para o caso de **selecionar previamente quais categorias serão trabalhadas** (antes de detalhar itens), o formulário de orçamento/OS terá um campo auxiliar `MultiSelectTags` (não persistido separadamente, ou persistido em `quotes.tags`/`service_orders.tags` como `uuid[]` referenciando `config_categories`, se necessário para filtros de relatório). **Decisão de incluir `tags uuid[]` será confirmada na Fase 5** — adiciona índice GIN (`USING gin`) se aprovado.

---

## 10. Realtime

- **Supabase Realtime (Postgres Changes)** habilitado nas tabelas: `appointments`, `service_orders`, `service_order_status_history`, `accounts_receivable_installments`, `accounts_payable_installments`, `notifications`.
- **Dashboard**: assina mudanças agregadas (via `postgres_changes` em tabelas-chave) para atualizar KPIs sem refresh; cálculos pesados (somatórios) preferencialmente via `RPC`/Views invalidadas por TanStack Query `refetchOnWindowFocus` + canal Realtime disparando `queryClient.invalidateQueries`.
- **Agenda**: assina `appointments` para refletir criação/edição/drag-and-drop entre usuários simultâneos.
- **OS Kanban/Lista**: assina `service_orders` e `service_order_status_history` para atualizar status em tempo real (ex.: técnico move card).
- **Notificações**: assina `notifications` filtrando por `user_id` (canal privado) para o sino do topbar.
- RLS aplica-se também aos canais Realtime (Supabase respeita policies de SELECT) — incluindo o filtro `organization_id = fn_current_org_id()`.

### 10.1 Performance: Views Materializadas, Particionamento e Paginação

**Views materializadas para Dashboard/Relatórios**

| View                      | Conteúdo                                                                                                                         | Refresh                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `mv_dashboard_kpis`       | Por organização: totais de clientes/veículos, OS por status, faturamento do mês, ticket médio, recebimentos pendentes/realizados | `REFRESH MATERIALIZED VIEW CONCURRENTLY` via `pg_cron` a cada 5–15 min |
| `mv_revenue_by_month`     | Receita agregada por mês/categoria financeira                                                                                    | refresh diário (ou após baixa de parcela, via `pg_notify` + job)       |
| `mv_service_order_funnel` | Contagem de OS por status/período (gráfico "OS por status")                                                                      | refresh a cada 15 min                                                  |

- Todas as MVs incluem `organization_id` na chave e um índice único (`CREATE UNIQUE INDEX` é exigido para `REFRESH ... CONCURRENTLY`).
- Relatórios com filtros muito específicos (cliente, veículo, usuário, período arbitrário) **não** usam as MVs — consultam as tabelas base diretamente, com índices compostos dedicados (ver abaixo). As MVs cobrem apenas os agregados "quentes" do Dashboard.
- Caso o Free Tier do Supabase não disponibilize `pg_cron`, o refresh é feito por uma Edge Function agendada (cron job na Vercel ou `supabase functions schedule`, conforme disponibilidade) — decisão técnica confirmada na Fase 9.

**Índices compostos para listas e relatórios de alto volume**

- `quotes`: `(organization_id, status_id, issue_date DESC)`, `(organization_id, client_id)`.
- `service_orders`: `(organization_id, status_id, entry_date DESC)`, `(organization_id, assigned_to)`.
- `accounts_receivable_installments` / `accounts_payable_installments`: `(organization_id, status, due_date)`.
- `audit_logs`, `entity_events`, `financial_audit_logs`, `notifications`: `(organization_id, created_at DESC)` — suportam tanto consulta quanto particionamento (abaixo).

**Particionamento nativo (declarative partitioning)**

Tabelas append-only de crescimento rápido são **particionadas por mês (`RANGE` em `created_at`/`changed_at`) desde a criação**, pois retrofitar particionamento depois é custoso:

- `audit_logs`
- `entity_events`
- `financial_audit_logs`
- `notifications` (parcial — pode usar política de retenção/arquivamento em vez de partição, dado que é mutável via `read_at`)

Partições mensais são criadas automaticamente por uma rotina (Edge Function agendada ou `pg_partman`, se disponível). Partições antigas (> 12–24 meses) podem ser desanexadas e movidas para storage frio sem impactar a tabela ativa.

**Paginação**

- Listagens grandes (clientes, veículos, OS, orçamentos, auditoria) usam **paginação por cursor (keyset)**: `WHERE (created_at, id) < ($cursor_created_at, $cursor_id) ORDER BY created_at DESC, id DESC LIMIT N`, evitando o custo de `OFFSET` em tabelas grandes.
- `DataTable` no frontend suporta os dois modos (offset para telas pequenas/admin, cursor para listas operacionais grandes), mas o padrão recomendado desde já é cursor.

---

## 11. Roadmap de Implementação por Fases

### Fase 0 — Fundação do Projeto

- Setup Next.js + TS + Tailwind + Shadcn/UI + ESLint/Prettier.
- Configuração Supabase (projeto, extensões: `pgcrypto`, `unaccent`, `pg_trgm`).
- Estrutura de pastas, `lib/supabase/*`, `middleware.ts` base.
- CI básico (lint + typecheck) e deploy inicial na Vercel.

### Fase 0.5 — Design System e Layout Base

- Revisão de UX/navegação (seção 4.6): agrupamento da sidebar em 5 grupos (Visão Geral, Atendimento, Cadastros, Financeiro, Gestão).
- Paleta de cores, tipografia (Josefin Sans) e tokens de tema claro/escuro (ver DECISIONS.md).
- Implementação da fundação visual, **navegável e sem regras de negócio**: Sidebar definitiva, Header/Topbar, Breadcrumbs, sistema de Cards, sistema de Tabelas (visual), sistema de Formulários (visual).
- Dashboard Operacional e Dashboard Gerencial (dados mockados).
- Pipeline de Orçamentos e Pipeline de Ordens de Serviço em visão Kanban (componente `KanbanBoard`, dados mockados).
- Sem CRUD, sem integração Supabase, sem autenticação — apenas estrutura visual e navegação completa entre rotas.

### Fase 1 — Multi-tenant, Autenticação e Núcleo RBAC

- Migration: `organizations` (seed da organização única da v1), `profiles`, `roles` (clonados do template padrão para a organização seed), `permissions` (seed da matriz módulo×ação), `role_permissions`, `user_permission_overrides` (já com coluna `scope`).
- Configuração do **Auth Hook** `custom_access_token_hook` (claims `organization_id`, `role_id` no JWT).
- Funções `fn_current_org_id`, `fn_current_role_id`, `fn_has_permission` + RLS base (template com isolamento por `organization_id`).
- Tela de Login, Recuperar Senha, Redefinir Senha.
- Middleware de autenticação + guard de permissão por rota.
- Hook `usePermissions` + `<PermissionGate>`.

### Fase 2 — Módulo de Usuários

- CRUD de usuários (Server Actions com `service_role` para criação/reset de senha), sempre vinculando `organization_id` do admin que cria.
- Upload de avatar (bucket `avatars`, registrado em `file_metadata`).
- Tela de matriz de permissões (papéis) + permissões individuais (overrides).

### Fase 3 — Configurações / Taxonomias / Numeração

- Migration `config_categories` (+ `normalized_name`, `usage_count`, constraints, `organization_id`).
- Migration `services`, `parts`.
- Migration `document_sequences` + função `fn_next_document_number` (base para `code` de clientes/veículos e numeração de orçamento/OS nas fases seguintes).
- CRUD genérico de categorias por `type` (componente reutilizável).
- `QuickCreateDialog` e `ComboboxAsync` (componentes base reutilizados em todas as fases seguintes).
- Seeds: status de orçamento, status de OS, formas de pagamento, motivos de cancelamento, tipos de agendamento, categorias padrão de serviço/peça/financeira.

### Fase 4 — Clientes e Veículos

- Migrations `clients` (com `code`), `vehicles` (com `code`), `file_metadata`.
- CRUDs completos + upload de fotos/documentos (buckets `vehicle-photos`/`vehicle-documents`, registrados em `file_metadata`).
- Busca/listagem com `DataTable`, filtros, validação de duplicidade (documento/placa) por `organization_id`.
- Página de detalhe do cliente com abas: Veículos, Orçamentos, OS, Financeiro, **Timeline** (consultas cruzadas + `entity_events`).

### Fase 5 — Agenda

- Migration `appointments`.
- Calendário (dia/semana/mês), drag & drop, CRUD de eventos vinculados a cliente/veículo/OS.
- Realtime habilitado.
- Migration `notifications` + `notification_preferences` (estrutura pronta; canal `in_app` ativo, `whatsapp`/`email` reservados).
- Lembretes/alertas via `notifications` in-app; e-mail via Edge Function como stretch.

### Fase 5.5 — Vistoria e Jornada do Veículo (Pátio)

- Migration `vehicle_inspections` + `inspection_items` (checklist), com numeração amigável (`VIS-000012`) via `fn_next_document_number`.
- Migration `vehicle_shop_visits` + taxonomia `vehicle_journey_stage` (seed dos estágios padrão em `config_categories`).
- Telas: lista/detalhe de Vistorias (com diagrama de avarias `damage_map` e fotos via `file_metadata`), e board do Pátio (`/patio`) por `current_stage_id`.
- Ação "Gerar Orçamento a partir da Vistoria" (preenche `vehicle_inspections.quote_id`).
- Novo módulo de permissão `vistorias` na matriz RBAC (seção 8.1).

### Fase 6 — Orçamentos

- Migrations `quotes`, `quote_items`, triggers de recálculo de totais, integração com `fn_next_document_number` (`quote_number`), trigger `fn_log_entity_event` para timeline (incluindo espelhamento para `entity_type='vehicle'`, seção 7.11.1) e atualização de `vehicle_shop_visits.current_stage_id`.
- Formulário completo (multi-itens, multi-categoria/serviço, descontos, impostos).
- Fluxo de status (elaboração → enviado → aprovado/reprovado/cancelado).
- Geração de PDF (Edge Function) + impressão + compartilhamento (link/URL assinada).
- Conversão de Orçamento → Ordem de Serviço.

### Fase 7 — Ordens de Serviço

- Migrations `service_orders` (com `os_number`), `service_order_items`, `service_order_checklist_items`, `service_order_status_history`, `service_order_time_logs`.
- Fotos/anexos via `file_metadata` (`entity_type='service_order'`).
- Fluxo completo de status com histórico/timeline (`entity_events`, incluindo espelhamento para `entity_type='vehicle'`, seção 7.11.1) e atualização de `vehicle_shop_visits.current_stage_id`/`checked_out_at` (entrega).
- Checklist, upload de fotos (antes/depois), apontamento de tempo.
- Pipeline de OS (Kanban) com dados reais, substituindo os dados mockados da Fase 0.5.
- PDF da OS.

### Fase 8 — Financeiro

- Migrations `suppliers`, `accounts_receivable(+installments)`, `accounts_payable(+installments)`, view `cash_flow_entries`.
- Migration `financial_audit_logs` + trigger `fn_financial_audit_trigger` (hash-chain, append-only) aplicado a todas as tabelas financeiras desde o primeiro registro.
- Geração automática de contas a receber a partir da OS concluída/entregue.
- Telas: Contas a Receber, Contas a Pagar, Fluxo de Caixa, DRE (agregações por `financial_category`).
- Baixa de parcelas (registro de pagamento/recebimento), formas de pagamento (taxonomia).

### Fase 9 — Dashboard, Realtime Avançado e Views Materializadas

- Substituição dos dados mockados do Dashboard Operacional/Gerencial (Fase 0.5) por dados reais.
- KPIs (clientes, veículos, orçamentos abertos, OS em andamento/concluídas, faturamento, ticket médio, serviços mais vendidos).
- Migrations `mv_dashboard_kpis`, `mv_revenue_by_month`, `mv_service_order_funnel` + job de refresh (`pg_cron` ou Edge Function agendada).
- Gráficos (Recharts): receita por período, OS por período/status, fluxo financeiro.
- Filtros de período (hoje/semana/mês/ano/custom) com cache e Realtime.

### Fase 10 — Relatórios

- Motor de relatórios com filtros combináveis (cliente, veículo, serviço, categoria, usuário, período, status), usando paginação por cursor e índices compostos `(organization_id, ...)`.
- Relatórios: financeiro, clientes, veículos, OS, orçamentos, serviços, produtividade, faturamento.
- Exportação PDF e Excel (`xlsx`).

### Fase 11 — Auditoria

- Migration `audit_logs` (particionada por mês) + trigger genérico `fn_audit_trigger` aplicado nas tabelas de domínio.
- Migration `entity_events` (particionada por mês) + integração com timelines de cliente/veículo/orçamento/OS.
- Captura de `login`/`logout` com IP.
- Tela de auditoria com filtros avançados (usuário, módulo, ação, período, entidade) e tela de timeline por entidade.

### Fase 12 — Polimento, Performance e Lançamento

- Revisão de responsividade (mobile/tablet) em todos os módulos.
- Revisão de acessibilidade (Radix/Shadcn já ajuda, validar contraste no dark mode).
- Testes E2E dos fluxos críticos (login, orçamento→OS→financeiro).
- Revisão de índices, EXPLAIN ANALYZE nas telas mais pesadas, validação de particionamento/paginação cursor sob carga.
- Hardening de RLS (revisão final de todas as policies, incluindo isolamento multi-tenant e imutabilidade de `financial_audit_logs`).
- Documentação de operação (runbook) e preparação para eventual migração de hosting.

### Fase 13 — Integrações Externas (Pós-MVP)

- Migration `integration_settings` + integração com Supabase Vault para credenciais.
- WhatsApp: `whatsapp_conversations`, `whatsapp_messages`, Edge Function de envio (Evolution API ou Meta Cloud API), canal `notifications.channel='whatsapp'`.
- NF-e/NFS-e: `fiscal_documents`, integração com provedor (ex.: Focus NFe/eNotas), emissão a partir de OS/contas a receber.
- Pagamentos: `payment_transactions`, integração com gateway (Stripe/Mercado Pago/PagSeguro), webhook de confirmação atualizando `accounts_receivable_installments`.
- Cada integração é independente e habilitável por organização via `integration_settings.is_active` — não bloqueia o lançamento do core do ERP.

> Cada fase é independentemente entregável e testável; a ordem respeita dependências de dados (organização/RBAC antes de tudo, taxonomias antes de orçamentos/OS, clientes/veículos antes de agenda/orçamentos, etc.).

---

## 12. Convenções e Boas Práticas

- **Nomenclatura de banco**: `snake_case`, tabelas no plural, FKs `<entidade>_id`.
- **Nomenclatura de frontend**: componentes `PascalCase`, hooks `useCamelCase`, rotas em português (alinhado ao domínio do usuário final), código/identificadores em inglês.
- **Migrations**: uma migration por domínio funcional (ver estrutura de pastas), sempre reversível quando possível (`-- down` documentado em comentário, já que Supabase CLI usa migrations forward-only por padrão — manter script de rollback manual em `supabase/migrations/rollback/`).
- **Tipagem ponta a ponta**: `supabase gen types typescript` gera `types/database.types.ts`; Zod schemas derivam/validam contra esses tipos.
- **Mensagens e erros**: padronizados em `lib/constants/messages.ts`, em português.
- **Variáveis de ambiente**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client), `SUPABASE_SERVICE_ROLE_KEY` (server-only, nunca exposto ao bundle client).

---

## 14. Resumo da Revisão Técnica (v1.1)

Revisão solicitada antes da Fase 0, considerando: SaaS multiempresa, integrações futuras (WhatsApp, NF-e/NFS-e, pagamentos), grandes volumes, auditoria financeira imutável, performance de dashboards/relatórios, storage, notificações, timeline, RBAC granular, taxonomias e numeração amigável.

### Veredito

**A arquitetura está aprovada para iniciar a Fase 0.** As lacunas identificadas eram estruturais (schema/RLS) e foram incorporadas diretamente nesta revisão — não há pendências que exijam nova rodada de validação antes do início da implementação.

### Alterações aplicadas nesta revisão

| #   | Alteração                                                                                                                                                                                                                                                                                     | Motivo                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Tabela `organizations` real + `organization_id NOT NULL` em todas as tabelas de negócio (antes era "placeholder" com default fixo)                                                                                                                                                            | Multi-tenant SaaS sem retrabalho estrutural futuro                                      |
| 2   | `roles` agora é por `organization_id` (clonado de template no onboarding)                                                                                                                                                                                                                     | Cada tenant pode customizar papéis sem afetar outros                                    |
| 3   | Auth Hook (`custom_access_token_hook`) injetando `organization_id`/`role_id` no JWT; `fn_current_org_id`/`fn_current_role_id`                                                                                                                                                                 | Performance de RLS em volume alto (evita subquery por linha)                            |
| 4   | RLS padrão revisado para incluir `organization_id = fn_current_org_id()` em todas as policies                                                                                                                                                                                                 | Isolamento de tenant obrigatório, não opcional                                          |
| 5   | `document_sequences` + `fn_next_document_number`; `clients.code` e `vehicles.code`                                                                                                                                                                                                            | Numeração amigável (CLI-000123, VEI-000045) por organização, sem depender de UUID       |
| 6   | `entity_events` (timeline polimórfica de cliente/veículo/orçamento/OS)                                                                                                                                                                                                                        | Histórico de negócio navegável, separado da auditoria técnica                           |
| 7   | `notifications` + `notification_preferences` (Realtime habilitado)                                                                                                                                                                                                                            | Base para notificações in-app e, futuramente, e-mail/WhatsApp                           |
| 8   | `financial_audit_logs` append-only com hash-chain, sem `UPDATE`/`DELETE` possível por nenhum papel                                                                                                                                                                                            | Auditoria financeira imutável (requisito explícito)                                     |
| 9   | `file_metadata` genérica substitui `vehicle_media` e `service_order_attachments`                                                                                                                                                                                                              | Padronização global, controle de uso de storage por tenant, RLS de Storage simplificada |
| 10  | Stubs `integration_settings`, `whatsapp_conversations/messages`, `fiscal_documents`, `payment_transactions` (+ Supabase Vault para credenciais)                                                                                                                                               | Integrações futuras sem alterar o core; implementação na Fase 13                        |
| 11  | Coluna `scope` (`'all'\|'own'`) em `role_permissions`/`user_permission_overrides`                                                                                                                                                                                                             | Prepara RBAC para regras "técnico só vê suas OS" sem nova migração                      |
| 12  | Views materializadas (`mv_dashboard_kpis`, `mv_revenue_by_month`, `mv_service_order_funnel`) + índices compostos `(organization_id, ...)`                                                                                                                                                     | Performance de dashboard/relatórios em volume alto                                      |
| 13  | Particionamento mensal nativo desde a criação para `audit_logs`, `entity_events`, `financial_audit_logs`                                                                                                                                                                                      | Retrofit de particionamento é custoso; antecipar evita migração dolorosa                |
| 14  | Paginação por cursor (keyset) recomendada para listas grandes                                                                                                                                                                                                                                 | Evita degradação de `OFFSET` em tabelas com milhões de linhas                           |
| 15  | Roadmap: Fase 1 absorve `organizations`/Auth Hook/RBAC com `scope`; Fase 3 adiciona `document_sequences`; Fase 8 adiciona `financial_audit_logs`; Fase 9 adiciona views materializadas; Fase 11 adiciona `entity_events` e particionamento; nova **Fase 13 — Integrações Externas (Pós-MVP)** | Sequenciamento reflete as novas peças sem adiar o lançamento do core                    |

### Itens já cobertos pela proposta original (sem mudanças)

- Padronização global de taxonomias via `config_categories` (normalização case/espaço-insensível, `usage_count`, cadastro rápido) — mantido como estava.
- Soft delete, timestamps padrão, UUIDs, RLS por módulo×ação — mantidos como base, apenas estendidos com o filtro de organização.
- Stack frontend/backend (Next.js + Supabase + Vercel) — sem alterações.

### Pontos a confirmar no início da fase correspondente (não bloqueiam a Fase 0)

- `cash_flow_entries` como view vs. tabela física (Fase 8).
- `tags uuid[]` em `quotes`/`service_orders` para pré-seleção de categorias (Fase 6), caso necessário para filtros de relatório.
- Disponibilidade de `pg_cron` no plano Supabase utilizado (Fase 9) — alternativa via Edge Function agendada já documentada.

---

## Próximos Passos

1. ~~Validar este documento com o time/stakeholder.~~ — Revisão técnica concluída (v1.1), arquitetura aprovada.
2. Iniciar **Fase 0** (setup do projeto) seguida da **Fase 1** (Multi-tenant + Auth + RBAC), que são pré-requisitos de todas as demais.
3. Os "Pontos a confirmar" listados na seção 14 serão decididos no início das fases correspondentes (6, 8 e 9), sem impacto no início da Fase 0.
