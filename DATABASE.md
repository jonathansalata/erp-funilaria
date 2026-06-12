# Banco de Dados

> Documentação completa do modelo de dados: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), seções
> 5 (Backend/Supabase), 6 (Modelagem) e 7 (Tabelas, Relacionamentos, Índices e RLS).
>
> **Status (Fase 0)**: nenhuma migration de schema foi implementada ainda. As migrations abaixo
> são placeholders que definem apenas a ordem e o escopo de cada etapa.

## Migrations

Localizadas em `supabase/migrations/`, numeradas sequencialmente. Cada arquivo é um placeholder
até a fase correspondente do roadmap (seção 11 do ARCHITECTURE.md) ser implementada:

| Arquivo                     | Conteúdo previsto                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `0001_init_extensions.sql`  | Extensões do Postgres (`pgcrypto`, `unaccent`, `pg_trgm`, etc.)                                                                      |
| `0002_rbac.sql`             | `organizations`, `profiles`, `roles`, `permissions`, `role_permissions`, `user_permission_overrides`                                 |
| `0003_taxonomies.sql`       | `config_categories` e demais taxonomias globais (status, formas de pagamento, categorias de serviço/peça/financeiro)                 |
| `0004_clients_vehicles.sql` | `clients`, `vehicles`, `document_sequences`                                                                                          |
| `0005_agenda.sql`           | `appointments`                                                                                                                       |
| `0006_quotes.sql`           | `quotes`, `quote_items`                                                                                                              |
| `0007_service_orders.sql`   | `service_orders`, `service_order_items`, checklist, histórico de status, apontamento de horas                                        |
| `0008_financial.sql`        | `accounts_receivable`, `accounts_payable`, `suppliers`, `cash_flow_entries`                                                          |
| `0009_audit.sql`            | `audit_logs`, `entity_events` (timeline) e `financial_audit_logs` (hash-chain, append-only)                                          |
| `0010_storage_policies.sql` | `file_metadata` (tabela polimórfica de arquivos), buckets do Supabase Storage e políticas de RLS de acesso                           |
| `0011_inspections.sql`      | `vehicle_inspections`, `inspection_items` (Fase 5.5 — módulo de Vistoria, ver ARCHITECTURE.md seção 7.4.1)                           |
| `0012_vehicle_journey.sql`  | `vehicle_shop_visits` + taxonomia `vehicle_journey_stage` em `config_categories` (Fase 5.5 — Pátio, ver ARCHITECTURE.md seção 7.4.2) |

> As migrations `0011`/`0012` são numeradas ao final (após `0010`) por convenção de criação de arquivos, mas são **implementadas na Fase 5.5**, entre Clientes/Veículos (Fase 4) e Orçamentos (Fase 6). Suas dependências diretas — `clients`/`vehicles` (`0004`), `config_categories` (`0003`) e `file_metadata` (`0010`) — já existem nesse ponto. As colunas `vehicle_inspections.quote_id` e `vehicle_shop_visits.service_order_id` referenciam tabelas criadas depois (`0006`/`0007`); são adicionadas via `ALTER TABLE ... ADD COLUMN` nas próprias migrations `0006_quotes.sql`/`0007_service_orders.sql`, não em `0011`/`0012`.

`supabase/seed.sql` conterá os dados iniciais de desenvolvimento (organização seed, papéis,
taxonomias padrão, usuário administrador).

## Convenções de modelagem (resumo)

- **PK**: `id UUID DEFAULT gen_random_uuid()`.
- **Timestamps**: `created_at` / `updated_at` (`TIMESTAMPTZ`, `updated_at` via trigger) e
  `deleted_at` para soft delete.
- **Rastreabilidade**: `created_by UUID REFERENCES profiles(id)` em tabelas operacionais.
- **Multi-tenant**: toda tabela de negócio tem `organization_id UUID NOT NULL`, com índice e RLS
  já preparados (valor único fixo na v1, mas pronto para múltiplas organizações).
- **Status configuráveis**: status de negócio (orçamento, OS) usam `config_categories`
  (`quote_status`, `service_order_status`) em vez de `ENUM` do Postgres, permitindo customização
  futura. Valores essenciais marcados com `is_system = true`. O mesmo padrão é usado para a
  jornada física do veículo no pátio (`vehicle_journey_stage`, ver ARCHITECTURE.md seção 7.4.2).
- **Numeração amigável**: `clients`, `vehicles`, `quotes`, `service_orders` e `vehicle_inspections`
  recebem um código sequencial por organização (`document_sequences` + `fn_next_document_number`),
  além do `id` (UUID) — ex.: `ORC-2026-000123`, `CLI-000045`, `VIS-000012`.

## RBAC e RLS

- Autenticação via Supabase Auth (email/senha, sem signup público).
- Claims customizadas (`organization_id`, `role_id`) injetadas no JWT via
  `custom_access_token_hook`.
- Funções `STABLE` `fn_current_org_id()` / `fn_current_role_id()` / `fn_has_permission()` usadas
  nas policies de RLS para evitar joins repetidos.
- Padrão de RLS por módulo descrito em ARCHITECTURE.md, seção 7.9.

## Tipos TypeScript

`src/types/database.types.ts` é um placeholder (`Database` vazio). Após a primeira migration de
schema ser aplicada, gerar os tipos reais com:

```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

(ou `--local` ao usar a stack local via `npx supabase start`).

## Workflow de migrations

```bash
# criar uma nova migration
npx supabase migration new <nome>

# aplicar migrations no projeto remoto vinculado
npx supabase db push

# rodar localmente (requer Docker)
npx supabase start
npx supabase db reset
```
