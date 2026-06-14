-- =====================================================================================
-- FASE 3.1 — SCHEMA SQL FINAL (PARA APROVAÇÃO)
-- ERP Funilaria — Migração para Supabase (Postgres)
--
-- Status: RASCUNHO PARA APROVAÇÃO. Nada deste arquivo foi aplicado ao banco.
-- Consolida docs/ARCHITECTURE.md §6-11 (schema v1.1) + ajustes da ETAPA 2 de
-- docs/FASE3_PLANO.md (gap analysis Fase 2B x schema v1.1).
--
-- Organização: este arquivo espelha a futura divisão em migrations
-- (supabase/migrations/0001-0010+), mas é apresentado como um único documento
-- para revisão do modelo relacional completo antes do split em arquivos.
--
-- Convenções gerais (ver docs/ARCHITECTURE.md §6.2):
--   - PK: id uuid DEFAULT gen_random_uuid()
--   - created_at/updated_at timestamptz DEFAULT now(); updated_at via trigger
--     fn_set_updated_at()
--   - deleted_at timestamptz NULL (soft delete)
--   - organization_id uuid NOT NULL REFERENCES organizations(id) em toda tabela
--     de negócio
--   - created_by uuid REFERENCES profiles(id) em tabelas operacionais
-- =====================================================================================


-- =====================================================================================
-- SEÇÃO 1 — EXTENSÕES E FUNÇÕES GENÉRICAS  (Fase 3.1 / migration 0001_init_extensions.sql)
-- =====================================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- fn_normalize_text
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- busca fuzzy (placas, nomes)

-- updated_at automático
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- normalização para índices únicos case/acento-insensíveis
CREATE OR REPLACE FUNCTION fn_normalize_text(p_text text)
RETURNS text AS $$
  SELECT lower(unaccent(trim(p_text)));
$$ LANGUAGE sql IMMUTABLE;

-- claims do JWT (organization_id / role_id injetados pelo Custom Access Token Hook)
CREATE OR REPLACE FUNCTION fn_current_org_id()
RETURNS uuid AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION fn_current_role_id()
RETURNS uuid AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role_id')::uuid;
$$ LANGUAGE sql STABLE;

-- fn_has_permission, fn_next_document_number, fn_log_entity_event,
-- fn_financial_audit_trigger, fn_recalc_quote_totals, fn_increment_taxonomy_usage
-- são definidas após as tabelas que referenciam (Seções 2, 3, 9, 11, 12) — corpo
-- completo apresentado nas seções correspondentes para manter a leitura na ordem
-- de dependência.


-- =====================================================================================
-- SEÇÃO 2 — MULTI-TENANT, IDENTIDADE E RBAC  (Fase 3.2 / migration 0002_rbac.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  document    text,
  plan        text NOT NULL DEFAULT 'free',
  status      text NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','suspended','cancelled')),
  settings    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Seed v1: organização única (substitui o placeholder
-- '00000000-0000-0000-0000-000000000001' citado em ARCHITECTURE.md §6.2)
INSERT INTO organizations (id, name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Oficina Demo', 'oficina-demo', 'active');


-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------
CREATE TABLE roles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name            text NOT NULL,
  description     text,
  is_system       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_roles_org_name ON roles (organization_id, name)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- AJUSTE ETAPA 2 / ETAPA 5 (FASE3_PLANO.md): seed alinhado aos 5 papéis REAIS do
-- mock (administrador/gerente/financeiro/operacional/personalizado), substituindo
-- Atendente/Técnico do schema v1.1 original. "Personalizado" não tem seed fixo —
-- é criado ad-hoc por organização quando o admin cria um papel customizado.
INSERT INTO roles (organization_id, name, description, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Administrador', 'Acesso total ao sistema', true),
  ('00000000-0000-0000-0000-000000000001', 'Gerente', 'Gestão operacional e comercial', false),
  ('00000000-0000-0000-0000-000000000001', 'Financeiro', 'Acesso ao módulo financeiro e leitura geral', false),
  ('00000000-0000-0000-0000-000000000001', 'Operacional', 'Atendimento, vistorias, orçamentos e OS', false);


-- ---------------------------------------------------------------------------
-- permissions
-- AJUSTE ETAPA 2 / ETAPA 5: action passa de 4 para 7 valores
-- (view, create, edit, delete, approve, cancel, financial), alinhado ao
-- PermissionAction do mock. module ganha "usuarios" como módulo próprio
-- (12 módulos, igual ao schema v1.1 — mock hoje funde em "configuracoes",
-- mas a UI ganhará aba própria, ver FASE3_PLANO ETAPA 5).
-- ---------------------------------------------------------------------------
CREATE TABLE permissions (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL CHECK (module IN (
    'dashboard','clientes','veiculos','vistorias','agenda','orcamentos',
    'ordens_servico','financeiro','relatorios','configuracoes','auditoria','usuarios'
  )),
  action text NOT NULL CHECK (action IN (
    'view','create','edit','delete','approve','cancel','financial'
  )),
  UNIQUE (module, action)
);

-- Seed: cada módulo recebe apenas as ações que fazem sentido (mesma matriz do
-- PermissionMatrix mockado, src/lib/mock-data/users.ts). dashboard/relatorios/
-- auditoria = somente view. demais módulos operacionais = view/create/edit/delete
-- (+ approve/cancel/financial onde aplicável).
INSERT INTO permissions (module, action)
SELECT m, a FROM (VALUES
  ('dashboard','view'),
  ('relatorios','view'),
  ('auditoria','view'),
  ('clientes','view'),('clientes','create'),('clientes','edit'),('clientes','delete'),
  ('veiculos','view'),('veiculos','create'),('veiculos','edit'),('veiculos','delete'),
  ('vistorias','view'),('vistorias','create'),('vistorias','edit'),('vistorias','delete'),
  ('agenda','view'),('agenda','create'),('agenda','edit'),('agenda','delete'),
  ('orcamentos','view'),('orcamentos','create'),('orcamentos','edit'),('orcamentos','delete'),
    ('orcamentos','approve'),('orcamentos','cancel'),
  ('ordens_servico','view'),('ordens_servico','create'),('ordens_servico','edit'),
    ('ordens_servico','delete'),('ordens_servico','cancel'),
  ('financeiro','view'),('financeiro','create'),('financeiro','edit'),('financeiro','delete'),
    ('financeiro','financial'),
  ('configuracoes','view'),('configuracoes','create'),('configuracoes','edit'),('configuracoes','delete'),
  ('usuarios','view'),('usuarios','create'),('usuarios','edit'),('usuarios','delete')
) AS t(m, a);


-- ---------------------------------------------------------------------------
-- role_permissions
-- ---------------------------------------------------------------------------
CREATE TABLE role_permissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  allowed       boolean NOT NULL DEFAULT true,
  scope         text NOT NULL DEFAULT 'all' CHECK (scope IN ('all','own')),
  UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions (role_id);

-- Seed de role_permissions: replica ROLE_PERMISSION_PRESETS de
-- src/lib/mock-data/users.ts. Administrador = todas as permissions (allowed=true).
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, true
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Administrador' AND r.organization_id = '00000000-0000-0000-0000-000000000001';

-- NOTA: o seed completo de Gerente/Financeiro/Operacional (linha a linha,
-- replicando ROLE_PERMISSION_PRESETS) será detalhado na migration 0002 —
-- omitido aqui para não duplicar ~150 linhas de INSERT no schema de revisão.
-- A estrutura (tabela + constraints + índice) é o que está em aprovação nesta etapa.


-- ---------------------------------------------------------------------------
-- profiles  (1:1 com auth.users)
-- AJUSTE ETAPA 2 / ETAPA 5: + must_change_password; status com 3 valores
-- (ativo/inativo/bloqueado no mock -> active/inactive/blocked)
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id     uuid NOT NULL REFERENCES organizations(id),
  full_name           text NOT NULL,
  email               text NOT NULL UNIQUE,
  phone               text,
  avatar_url          text,
  job_title           text,
  role_id             uuid REFERENCES roles(id),
  status              text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','inactive','blocked')),
  theme_preference    text NOT NULL DEFAULT 'system'
                      CHECK (theme_preference IN ('light','dark','system')),
  must_change_password boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

CREATE INDEX idx_profiles_organization_id ON profiles (organization_id);
CREATE INDEX idx_profiles_role_id ON profiles (role_id);
CREATE INDEX idx_profiles_status ON profiles (status);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- user_permission_overrides
-- ---------------------------------------------------------------------------
CREATE TABLE user_permission_overrides (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  allowed       boolean NOT NULL,
  scope         text NOT NULL DEFAULT 'all' CHECK (scope IN ('all','own')),
  UNIQUE (user_id, permission_id)
);

CREATE INDEX idx_user_permission_overrides_user ON user_permission_overrides (user_id);


-- ---------------------------------------------------------------------------
-- fn_has_permission — resolução de permissão efetiva (override > role > false)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_has_permission(p_module text, p_action text)
RETURNS boolean AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_role_id   uuid := fn_current_role_id();
  v_perm_id   uuid;
  v_override  boolean;
  v_role_perm boolean;
BEGIN
  SELECT id INTO v_perm_id FROM permissions WHERE module = p_module AND action = p_action;
  IF v_perm_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT allowed INTO v_override
  FROM user_permission_overrides
  WHERE user_id = v_user_id AND permission_id = v_perm_id;

  IF v_override IS NOT NULL THEN
    RETURN v_override;
  END IF;

  SELECT allowed INTO v_role_perm
  FROM role_permissions
  WHERE role_id = v_role_id AND permission_id = v_perm_id;

  RETURN coalesce(v_role_perm, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ---------------------------------------------------------------------------
-- RLS — organizations, roles, permissions, role_permissions, profiles,
-- user_permission_overrides
-- ---------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_organizations" ON organizations FOR SELECT
  USING (id = fn_current_org_id());
CREATE POLICY "update_organizations" ON organizations FOR UPDATE
  USING (id = fn_current_org_id() AND fn_has_permission('configuracoes','edit'))
  WITH CHECK (id = fn_current_org_id() AND fn_has_permission('configuracoes','edit'));

-- permissions: catálogo fixo, leitura liberada a qualquer autenticado
CREATE POLICY "select_permissions" ON permissions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "select_roles" ON roles FOR SELECT
  USING (deleted_at IS NULL AND organization_id = fn_current_org_id());
CREATE POLICY "write_roles" ON roles FOR ALL
  USING (organization_id = fn_current_org_id() AND fn_has_permission('configuracoes','edit'))
  WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission('configuracoes','edit'));

CREATE POLICY "select_role_permissions" ON role_permissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND r.organization_id = fn_current_org_id()));
CREATE POLICY "write_role_permissions" ON role_permissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND r.organization_id = fn_current_org_id())
    AND fn_has_permission('configuracoes','edit')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND r.organization_id = fn_current_org_id())
    AND fn_has_permission('configuracoes','edit')
  );

-- profiles: usuário lê/edita o próprio perfil; leitura/escrita de outros perfis exige 'usuarios'
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  USING (id = auth.uid() OR (deleted_at IS NULL AND organization_id = fn_current_org_id() AND fn_has_permission('usuarios','view')));
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  USING (id = auth.uid() OR (organization_id = fn_current_org_id() AND fn_has_permission('usuarios','edit')))
  WITH CHECK (organization_id = fn_current_org_id());
CREATE POLICY "insert_profiles" ON profiles FOR INSERT
  WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission('usuarios','create'));

CREATE POLICY "select_user_permission_overrides" ON user_permission_overrides FOR SELECT
  USING (user_id = auth.uid() OR fn_has_permission('usuarios','view'));
CREATE POLICY "write_user_permission_overrides" ON user_permission_overrides FOR ALL
  USING (fn_has_permission('usuarios','edit'))
  WITH CHECK (fn_has_permission('usuarios','edit'));

-- =====================================================================================
-- SEÇÃO 3 — TAXONOMIAS, NUMERAÇÃO, CHECKLISTS E CONTAS BANCÁRIAS
-- (Fase 3.3 / migration 0003_taxonomies.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- config_categories
-- AJUSTE ETAPA 2 (gap mais estrutural): + coluna `code` (text, imutável,
-- definida na criação) — equivalente ao StatusConfig.key do mock. `name`/
-- `normalized_name` permanecem editáveis; `code` nunca muda após criado e é
-- usado por lógica de negócio (ex.: identificar o status "rascunho" mesmo se
-- o label exibido for renomeado para "Em elaboração").
-- `type` ganha os valores novos identificados na auditoria: cost_center, team,
-- observation_template, refusal_reason (além dos já previstos no schema v1.1).
-- ---------------------------------------------------------------------------
CREATE TABLE config_categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  type            text NOT NULL CHECK (type IN (
    'service_category','part_category','financial_category','maintenance_category',
    'payment_method','service_type','cancellation_reason','refusal_reason',
    'appointment_type','quote_status','service_order_status','vehicle_fuel_type',
    'vehicle_journey_stage','cost_center','team','observation_template'
  )),
  code            text NOT NULL,
  name            text NOT NULL,
  normalized_name text GENERATED ALWAYS AS (fn_normalize_text(name)) STORED,
  color           text,
  icon            text,
  description     text,
  is_system       boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      int NOT NULL DEFAULT 0,
  usage_count     int NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_config_categories_type_normalized
  ON config_categories (organization_id, type, normalized_name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_config_categories_type_code
  ON config_categories (organization_id, type, code) WHERE deleted_at IS NULL;
CREATE INDEX idx_config_categories_type_active
  ON config_categories (organization_id, type, is_active);

CREATE TRIGGER trg_config_categories_updated_at
  BEFORE UPDATE ON config_categories
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Seed mínimo de status "de sistema" (is_system=true, code estável) necessários
-- para os CHECKs/fluxos abaixo. Demais itens de taxonomia (formas de pagamento,
-- categorias de serviço/peça/financeira, motivos, equipes, etc.) são semeados na
-- migration 0003 a partir dos DEFAULT_* do mock (src/lib/mock-data/*), preservando
-- o `code` = chave atual (`StatusConfig.key`) e `name` = label atual.

-- quote_status (AJUSTE ETAPA 2: inclui 'em_negociacao', ausente no seed v1.1)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','quote_status','rascunho','Em elaboração',true,0),
  ('00000000-0000-0000-0000-000000000001','quote_status','enviado','Enviado',true,1),
  ('00000000-0000-0000-0000-000000000001','quote_status','em_negociacao','Em negociação',true,2),
  ('00000000-0000-0000-0000-000000000001','quote_status','aprovado','Aprovado',true,3),
  ('00000000-0000-0000-0000-000000000001','quote_status','reprovado','Reprovado',true,4),
  ('00000000-0000-0000-0000-000000000001','quote_status','cancelado','Cancelado',true,5);

-- service_order_status (AJUSTE ETAPA 2: 6 valores, inclui 'pausada')
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','service_order_status','aberta','Aberta',true,0),
  ('00000000-0000-0000-0000-000000000001','service_order_status','em_andamento','Em andamento',true,1),
  ('00000000-0000-0000-0000-000000000001','service_order_status','aguardando_peca','Aguardando peça',true,2),
  ('00000000-0000-0000-0000-000000000001','service_order_status','pausada','Pausada',true,3),
  ('00000000-0000-0000-0000-000000000001','service_order_status','concluida','Concluída',true,4),
  ('00000000-0000-0000-0000-000000000001','service_order_status','entregue','Entregue',true,5),
  ('00000000-0000-0000-0000-000000000001','service_order_status','cancelada','Cancelada',true,6);

-- vehicle_journey_stage (AJUSTE ETAPA 2: 8 valores — schema v1.1 tinha 6,
-- faltavam 'aguardando_inicio' e 'entregue', usados no Kanban /patio)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_vistoria','Aguardando vistoria',true,0),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','em_vistoria','Em vistoria',true,1),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_aprovacao','Aguardando aprovação',true,2),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_inicio','Aguardando início',true,3),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','em_execucao','Em execução',true,4),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_peca','Aguardando peça',true,5),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','pronto_para_retirada','Pronto para retirada',true,6),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','entregue','Entregue',true,7);

-- appointment_type (AJUSTE ETAPA 2: alinhado ao mock —
-- entrega/vistoria/retorno/atendimento/outros)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','appointment_type','vistoria','Vistoria',true,0),
  ('00000000-0000-0000-0000-000000000001','appointment_type','entrega','Entrega',true,1),
  ('00000000-0000-0000-0000-000000000001','appointment_type','retorno','Retorno',true,2),
  ('00000000-0000-0000-0000-000000000001','appointment_type','atendimento','Atendimento',true,3),
  ('00000000-0000-0000-0000-000000000001','appointment_type','outros','Outros',true,4);

-- NOTA: seeds completos de payment_method, service_category, part_category,
-- financial_category, cancellation_reason, refusal_reason, cost_center, team,
-- observation_template, maintenance_category, vehicle_fuel_type — extraídos
-- 1:1 dos arrays DEFAULT_* em src/lib/mock-data/{settings,financeiro,...}.ts —
-- serão detalhados na migration 0003 (lista extensa, omitida deste documento de
-- revisão de modelo relacional).


-- ---------------------------------------------------------------------------
-- services / parts
-- ---------------------------------------------------------------------------
CREATE TABLE services (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id             uuid NOT NULL REFERENCES organizations(id),
  category_id                 uuid REFERENCES config_categories(id),
  name                        text NOT NULL,
  normalized_name             text GENERATED ALWAYS AS (fn_normalize_text(name)) STORED,
  description                 text,
  default_price               numeric(12,2),
  estimated_duration_minutes  int,
  usage_count                 int NOT NULL DEFAULT 0,
  is_active                   boolean NOT NULL DEFAULT true,
  created_by                  uuid REFERENCES profiles(id),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  deleted_at                  timestamptz
);

CREATE UNIQUE INDEX idx_services_category_normalized
  ON services (category_id, normalized_name) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE parts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id),
  category_id      uuid REFERENCES config_categories(id),
  name             text NOT NULL,
  normalized_name  text GENERATED ALWAYS AS (fn_normalize_text(name)) STORED,
  sku              text,
  unit             text NOT NULL DEFAULT 'un',
  default_price    numeric(12,2),
  stock_quantity   numeric(12,2) NOT NULL DEFAULT 0,
  usage_count      int NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  created_by       uuid REFERENCES profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE UNIQUE INDEX idx_parts_category_normalized
  ON parts (category_id, normalized_name) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_parts_updated_at
  BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- checklist_templates / checklist_template_stages / checklist_template_items
-- NOVO (ETAPA 2): não existia no schema v1.1. Origem: Fase 2B.5
-- (Configurações > Templates de Checklist). Escopo: módulo `configuracoes`.
-- ---------------------------------------------------------------------------
CREATE TABLE checklist_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  kind            text NOT NULL CHECK (kind IN ('inspection','service_order')),
  name            text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      int NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX idx_checklist_templates_org_kind
  ON checklist_templates (organization_id, kind) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_checklist_templates_updated_at
  BEFORE UPDATE ON checklist_templates
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TABLE checklist_template_stages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  name        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

CREATE INDEX idx_checklist_template_stages_template
  ON checklist_template_stages (template_id);

CREATE TABLE checklist_template_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id   uuid NOT NULL REFERENCES checklist_template_stages(id) ON DELETE CASCADE,
  label      text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE INDEX idx_checklist_template_items_stage
  ON checklist_template_items (stage_id);

-- RLS: checklist_templates e dependentes seguem o módulo `configuracoes`
-- (template padrão da Seção 12); leitura também liberada para
-- `vistorias.view`/`ordens_servico.view` (consumo em formulários).


-- ---------------------------------------------------------------------------
-- bank_accounts
-- NOVO (ETAPA 2): origem mock `catalogs.banks` (BankAccount).
-- ---------------------------------------------------------------------------
CREATE TABLE bank_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  bank_name       text NOT NULL,
  agency          text,
  account         text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE TRIGGER trg_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- document_sequences + fn_next_document_number
-- AJUSTE ETAPA 2: entity_type ganha 'vehicle_inspection' (prefixo VIS) e
-- 'appointment' (prefixo AGD), além de quote/service_order/client/vehicle do
-- schema v1.1, e os novos 'accounts_receivable' (REC) / 'accounts_payable' (PAG).
-- ---------------------------------------------------------------------------
CREATE TABLE document_sequences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  entity_type     text NOT NULL CHECK (entity_type IN (
    'quote','service_order','client','vehicle','vehicle_inspection',
    'appointment','accounts_receivable','accounts_payable'
  )),
  year            int,
  prefix          text NOT NULL,
  last_number     bigint NOT NULL DEFAULT 0,
  UNIQUE (organization_id, entity_type, year)
);

CREATE OR REPLACE FUNCTION fn_next_document_number(p_org uuid, p_entity_type text)
RETURNS text AS $$
DECLARE
  v_prefix      text;
  v_year        int;
  v_use_year    boolean;
  v_last_number bigint;
  v_seq_id      uuid;
BEGIN
  v_use_year := p_entity_type IN ('quote','service_order');
  v_year := CASE WHEN v_use_year THEN extract(year FROM now())::int ELSE NULL END;

  v_prefix := CASE p_entity_type
    WHEN 'quote' THEN 'ORC'
    WHEN 'service_order' THEN 'OS'
    WHEN 'client' THEN 'CLI'
    WHEN 'vehicle' THEN 'VEI'
    WHEN 'vehicle_inspection' THEN 'VIS'
    WHEN 'appointment' THEN 'AGD'
    WHEN 'accounts_receivable' THEN 'REC'
    WHEN 'accounts_payable' THEN 'PAG'
  END;

  SELECT id, last_number INTO v_seq_id, v_last_number
  FROM document_sequences
  WHERE organization_id = p_org AND entity_type = p_entity_type
    AND (year = v_year OR (year IS NULL AND v_year IS NULL))
  FOR UPDATE;

  IF v_seq_id IS NULL THEN
    INSERT INTO document_sequences (organization_id, entity_type, year, prefix, last_number)
    VALUES (p_org, p_entity_type, v_year, v_prefix, 1)
    RETURNING last_number INTO v_last_number;
  ELSE
    UPDATE document_sequences SET last_number = last_number + 1
    WHERE id = v_seq_id
    RETURNING last_number INTO v_last_number;
  END IF;

  RETURN v_prefix || '-' || (CASE WHEN v_year IS NOT NULL THEN v_year || '-' ELSE '' END)
         || lpad(v_last_number::text, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- SEÇÃO 4 — CLIENTES E VEÍCULOS  (Fase 3.4 / migration 0004_clients_vehicles.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- clients
-- AJUSTE ETAPA 2: + fantasy_name, state_registration, responsible_name, status
-- (ativo/inativo/bloqueado). `vehicleIds` do mock não vira coluna — é derivado
-- de `vehicles.client_id`.
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     uuid NOT NULL REFERENCES organizations(id),
  code                text NOT NULL,
  full_name           text NOT NULL,
  fantasy_name        text,
  document            text,
  document_type       text CHECK (document_type IN ('cpf','cnpj')),
  state_registration  text,
  responsible_name    text,
  rg                  text,
  birth_date          date,
  phone               text,
  whatsapp            text,
  email               text,
  zip_code            text,
  address             text,
  address_number      text,
  address_complement  text,
  neighborhood        text,
  city                text,
  state               char(2),
  notes               text,
  status              text NOT NULL DEFAULT 'ativo'
                      CHECK (status IN ('ativo','inativo','bloqueado')),
  created_by          uuid REFERENCES profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

CREATE UNIQUE INDEX idx_clients_org_code ON clients (organization_id, code);
CREATE UNIQUE INDEX idx_clients_document ON clients (organization_id, document)
  WHERE document IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_clients_full_name ON clients USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_clients_phone ON clients (phone);

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_clients_set_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := fn_next_document_number(NEW.organization_id, 'client');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_set_code
  BEFORE INSERT ON clients
  FOR EACH ROW EXECUTE FUNCTION fn_clients_set_code();


-- ---------------------------------------------------------------------------
-- vehicles
-- AJUSTE ETAPA 2 (gap estrutural #1): + status, notes, journey_stage_id e
-- journey_stage_updated_at DENORMALIZADOS na própria tabela — alimentam o
-- Kanban /patio (8 estágios, ver vehicle_journey_stage na Seção 3). O schema
-- v1.1 original modelava a jornada apenas via `vehicle_shop_visits.current_stage_id`
-- (somente para visitas em aberto); o mock usa um campo sempre presente em
-- TODO veículo. Mantemos AMBOS: `vehicles.journey_stage_id` (estado atual,
-- sempre presente, fonte do Kanban) e `vehicle_shop_visits` (Seção 6, histórico
-- de entradas/saídas físicas) — `vehicle_shop_visits.current_stage_id` é
-- sincronizado a partir de `vehicles.journey_stage_id` por trigger.
-- year_manufacture/year_model unificados conforme schema v1.1 (o mock usa um
-- único `year`; migração de dados grava o mesmo valor em ambas as colunas).
-- ---------------------------------------------------------------------------
CREATE TABLE vehicles (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          uuid NOT NULL REFERENCES organizations(id),
  code                     text NOT NULL,
  client_id                uuid NOT NULL REFERENCES clients(id),
  plate                    text NOT NULL,
  brand                    text,
  model                    text,
  year_manufacture         smallint,
  year_model               smallint,
  color                    text,
  renavam                  text,
  chassis                  text,
  fuel_type_id             uuid REFERENCES config_categories(id),
  mileage                  int,
  status                   text NOT NULL DEFAULT 'ativo'
                           CHECK (status IN ('ativo','inativo')),
  notes                    text,
  journey_stage_id         uuid REFERENCES config_categories(id),
  journey_stage_updated_at timestamptz,
  created_by               uuid REFERENCES profiles(id),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

CREATE INDEX idx_vehicles_client_id ON vehicles (client_id);
CREATE UNIQUE INDEX idx_vehicles_org_plate ON vehicles (organization_id, plate)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_plate_trgm ON vehicles USING gin (plate gin_trgm_ops);
CREATE UNIQUE INDEX idx_vehicles_org_code ON vehicles (organization_id, code);
CREATE INDEX idx_vehicles_journey_stage ON vehicles (organization_id, journey_stage_id);

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_vehicles_set_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := fn_next_document_number(NEW.organization_id, 'vehicle');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_set_code
  BEFORE INSERT ON vehicles
  FOR EACH ROW EXECUTE FUNCTION fn_vehicles_set_code();

-- Fotos/documentos do veículo: file_metadata (Seção 11), entity_type='vehicle'.

-- =====================================================================================
-- SEÇÃO 5 — AGENDA  (Fase 3.5 / migration 0005_agenda.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- appointments
-- AJUSTE ETAPA 2: + code (prefixo AGD, via fn_next_document_number),
-- + inspection_id e quote_id (vínculos opcionais usados pelo mock além de
-- service_order_id). appointment_type_id segue config_categories
-- (type=appointment_type, seed na Seção 3 já alinhado ao mock).
-- ---------------------------------------------------------------------------
CREATE TABLE appointments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid NOT NULL REFERENCES organizations(id),
  code                    text NOT NULL,
  title                   text NOT NULL,
  appointment_type_id     uuid REFERENCES config_categories(id),
  client_id               uuid REFERENCES clients(id),
  vehicle_id              uuid REFERENCES vehicles(id),
  inspection_id           uuid REFERENCES vehicle_inspections(id),
  quote_id                uuid REFERENCES quotes(id),
  service_order_id        uuid REFERENCES service_orders(id),
  assigned_to             uuid REFERENCES profiles(id),
  starts_at               timestamptz NOT NULL,
  ends_at                 timestamptz NOT NULL,
  all_day                 boolean NOT NULL DEFAULT false,
  location                text,
  notes                   text,
  status                  text NOT NULL DEFAULT 'scheduled'
                          CHECK (status IN ('scheduled','confirmed','completed','cancelled')),
  reminder_minutes_before int,
  created_by              uuid REFERENCES profiles(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz
);

CREATE UNIQUE INDEX idx_appointments_org_code ON appointments (organization_id, code);
CREATE INDEX idx_appointments_starts_at ON appointments (organization_id, starts_at);
CREATE INDEX idx_appointments_assigned_to ON appointments (assigned_to);
CREATE INDEX idx_appointments_client_id ON appointments (client_id);
CREATE INDEX idx_appointments_vehicle_id ON appointments (vehicle_id);

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_appointments_set_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := fn_next_document_number(NEW.organization_id, 'appointment');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_set_code
  BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION fn_appointments_set_code();

-- NOTA DE ORDEM DE CRIAÇÃO: `appointments` referencia `vehicle_inspections`,
-- `quotes` e `service_orders` (Seções 6-8), que por sua vez não referenciam
-- `appointments` de volta exceto `vehicle_inspections.appointment_id`
-- (nullable). Em Postgres, FKs para tabelas criadas depois exigem que as
-- tabelas referenciadas já existam OU que as FKs sejam adicionadas via
-- `ALTER TABLE` após a criação de todas as tabelas do domínio. Na migration
-- real (0005_agenda.sql), `appointments` será criada SEM as FKs para
-- `inspection_id`/`quote_id`/`service_order_id`, que serão adicionadas via
-- `ALTER TABLE ... ADD CONSTRAINT` ao final da migration 0008 (quando todas as
-- tabelas referenciadas já existem). Este documento mantém a ordem "lógica"
-- (Agenda antes de Vistorias/Orçamentos/OS) para facilitar a leitura do modelo.

-- =====================================================================================
-- SEÇÃO 6 — VISTORIAS E JORNADA DO VEÍCULO (PÁTIO)
-- (Fase 3.5.5 / migration 0005b_inspections.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- vehicle_inspections
-- AJUSTE ETAPA 2: status com 3 valores (pendente/em_andamento/concluida — o
-- schema v1.1 tinha só draft/completed). fuel_level vira smallint 0-100
-- (percentual), em vez de texto livre ('1/4','1/2',...) — migração de dados
-- converte fração -> percentual no momento da migração real.
-- ---------------------------------------------------------------------------
CREATE TABLE vehicle_inspections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code            text NOT NULL,
  vehicle_id      uuid NOT NULL REFERENCES vehicles(id),
  client_id       uuid NOT NULL REFERENCES clients(id),
  appointment_id  uuid REFERENCES appointments(id),
  inspector_id    uuid REFERENCES profiles(id),
  inspection_date timestamptz NOT NULL DEFAULT now(),
  mileage         int,
  fuel_level      smallint CHECK (fuel_level BETWEEN 0 AND 100),
  damage_map      jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes           text,
  status          text NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','em_andamento','concluida')),
  quote_id        uuid REFERENCES quotes(id),
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_vehicle_inspections_org_code ON vehicle_inspections (organization_id, code);
CREATE INDEX idx_vehicle_inspections_vehicle_id ON vehicle_inspections (vehicle_id);
CREATE INDEX idx_vehicle_inspections_status ON vehicle_inspections (organization_id, status);

CREATE TRIGGER trg_vehicle_inspections_updated_at
  BEFORE UPDATE ON vehicle_inspections
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_vehicle_inspections_set_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := fn_next_document_number(NEW.organization_id, 'vehicle_inspection');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicle_inspections_set_code
  BEFORE INSERT ON vehicle_inspections
  FOR EACH ROW EXECUTE FUNCTION fn_vehicle_inspections_set_code();

-- damage_map (jsonb [{ id, x, y, view, severity, description }]):
--   view     IN ('frente','traseira','lateral_esquerda','lateral_direita','teto')
--   severity IN ('leve','moderado','grave')
-- Validados na camada de aplicação (Server Action / Zod schema), não via CHECK
-- no jsonb — consistente com a abordagem do mock.


-- ---------------------------------------------------------------------------
-- inspection_items (checklist da vistoria)
-- AJUSTE ETAPA 2: label->description, done->is_completed, + stage_name (para
-- agrupar itens por etapa, espelhando checklist_template_stages.name quando o
-- checklist é instanciado a partir de um template).
-- ---------------------------------------------------------------------------
CREATE TABLE inspection_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES vehicle_inspections(id) ON DELETE CASCADE,
  stage_name    text,
  description   text NOT NULL,
  is_completed  boolean NOT NULL DEFAULT false,
  sort_order    int NOT NULL DEFAULT 0
);

CREATE INDEX idx_inspection_items_inspection ON inspection_items (inspection_id);

-- Fotos: file_metadata (Seção 11), entity_type='inspection'.
-- Conversão para Orçamento: ação "Gerar Orçamento a partir da Vistoria" cria um
-- `quotes` com vehicle_id/client_id pré-preenchidos e grava
-- `vehicle_inspections.quote_id`.


-- ---------------------------------------------------------------------------
-- vehicle_shop_visits
-- current_stage_id sincronizado a partir de `vehicles.journey_stage_id`
-- (Seção 4) via trigger `fn_sync_shop_visit_stage` (definido na Seção 8, após
-- service_orders existir, pois o trigger também observa
-- quotes.status_id/service_orders.status_id).
-- ---------------------------------------------------------------------------
CREATE TABLE vehicle_shop_visits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  vehicle_id        uuid NOT NULL REFERENCES vehicles(id),
  client_id         uuid NOT NULL REFERENCES clients(id),
  service_order_id  uuid REFERENCES service_orders(id),
  inspection_id     uuid REFERENCES vehicle_inspections(id),
  checked_in_at     timestamptz NOT NULL DEFAULT now(),
  checked_out_at    timestamptz,
  current_stage_id  uuid REFERENCES config_categories(id),
  parking_spot      text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_shop_visits_open ON vehicle_shop_visits (organization_id, checked_out_at)
  WHERE checked_out_at IS NULL;
CREATE INDEX idx_vehicle_shop_visits_vehicle_id ON vehicle_shop_visits (vehicle_id);
CREATE INDEX idx_vehicle_shop_visits_current_stage ON vehicle_shop_visits (current_stage_id);

CREATE TRIGGER trg_vehicle_shop_visits_updated_at
  BEFORE UPDATE ON vehicle_shop_visits
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =====================================================================================
-- SEÇÃO 7 — ORÇAMENTOS  (Fase 3.6 / migration 0006_quotes.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- quotes
-- status_id segue config_categories (type=quote_status, seed Seção 3, já com
-- 'em_negociacao' — AJUSTE ETAPA 2).
-- ---------------------------------------------------------------------------
CREATE TABLE quotes (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id                 uuid NOT NULL REFERENCES organizations(id),
  quote_number                    text NOT NULL,
  client_id                       uuid NOT NULL REFERENCES clients(id),
  vehicle_id                      uuid NOT NULL REFERENCES vehicles(id),
  status_id                       uuid REFERENCES config_categories(id),
  issue_date                      date NOT NULL DEFAULT current_date,
  valid_until                     date,
  subtotal                        numeric(12,2) NOT NULL DEFAULT 0,
  discount_amount                 numeric(12,2) NOT NULL DEFAULT 0,
  discount_percent                numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount                      numeric(12,2) NOT NULL DEFAULT 0,
  total_amount                    numeric(12,2) NOT NULL DEFAULT 0,
  notes                           text,
  converted_to_service_order_id   uuid REFERENCES service_orders(id),
  created_by                      uuid REFERENCES profiles(id),
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now(),
  deleted_at                      timestamptz
);

CREATE UNIQUE INDEX idx_quotes_org_number ON quotes (organization_id, quote_number);
CREATE INDEX idx_quotes_client_id ON quotes (client_id);
CREATE INDEX idx_quotes_vehicle_id ON quotes (vehicle_id);
CREATE INDEX idx_quotes_status_id ON quotes (organization_id, status_id, issue_date DESC);

CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_quotes_set_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := fn_next_document_number(NEW.organization_id, 'quote');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quotes_set_number
  BEFORE INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION fn_quotes_set_number();


-- ---------------------------------------------------------------------------
-- quote_items
-- ---------------------------------------------------------------------------
CREATE TABLE quote_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id         uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  item_type        text NOT NULL CHECK (item_type IN ('service','part','custom')),
  service_id       uuid REFERENCES services(id),
  part_id          uuid REFERENCES parts(id),
  category_id      uuid REFERENCES config_categories(id),
  description      text NOT NULL,
  quantity         numeric(12,2) NOT NULL DEFAULT 1,
  unit_price       numeric(12,2) NOT NULL,
  discount_amount  numeric(12,2) NOT NULL DEFAULT 0,
  total_amount     numeric(12,2) GENERATED ALWAYS AS
                   ((quantity * unit_price) - discount_amount) STORED,
  sort_order       int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_items_quote_id ON quote_items (quote_id);

CREATE TRIGGER trg_quote_items_updated_at
  BEFORE UPDATE ON quote_items
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- fn_recalc_quote_totals: recalcula quotes.subtotal/total_amount ao alterar itens
CREATE OR REPLACE FUNCTION fn_recalc_quote_totals()
RETURNS trigger AS $$
DECLARE
  v_quote_id uuid := coalesce(NEW.quote_id, OLD.quote_id);
  v_subtotal numeric(12,2);
BEGIN
  SELECT coalesce(sum(total_amount), 0) INTO v_subtotal
  FROM quote_items WHERE quote_id = v_quote_id;

  UPDATE quotes SET
    subtotal = v_subtotal,
    total_amount = v_subtotal - discount_amount + tax_amount
  WHERE id = v_quote_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quote_items_recalc
  AFTER INSERT OR UPDATE OR DELETE ON quote_items
  FOR EACH ROW EXECUTE FUNCTION fn_recalc_quote_totals();


-- ---------------------------------------------------------------------------
-- quote_status_history
-- NOVO (ETAPA 2): origem mock `Quote.statusHistory` (StatusChangeEvent).
-- Mesma estrutura de service_order_status_history (Seção 8) + reason.
-- ---------------------------------------------------------------------------
CREATE TABLE quote_status_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  from_status_id  uuid REFERENCES config_categories(id),
  to_status_id    uuid NOT NULL REFERENCES config_categories(id),
  reason          text,
  changed_by      uuid REFERENCES profiles(id),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_status_history_quote ON quote_status_history (quote_id, created_at DESC);

-- Anexos do orçamento: file_metadata (Seção 11), entity_type='quote'.

-- =====================================================================================
-- SEÇÃO 8 — ORDENS DE SERVIÇO  (Fase 3.7 / migration 0007_service_orders.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- service_orders
-- AJUSTE ETAPA 2: + delivery_mileage (int), + warranty_period (int dias) —
-- novidades Fase 2B.8.3 (card "Entrega e Garantia" + PDF "Termo de Garantia").
-- status_id segue config_categories (type=service_order_status, 6 valores
-- incl. 'pausada', seed Seção 3 — AJUSTE ETAPA 2).
-- ---------------------------------------------------------------------------
CREATE TABLE service_orders (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          uuid NOT NULL REFERENCES organizations(id),
  os_number                text NOT NULL,
  quote_id                 uuid REFERENCES quotes(id),
  client_id                uuid NOT NULL REFERENCES clients(id),
  vehicle_id               uuid NOT NULL REFERENCES vehicles(id),
  status_id                uuid REFERENCES config_categories(id),
  assigned_to              uuid REFERENCES profiles(id),
  entry_date               timestamptz NOT NULL DEFAULT now(),
  expected_delivery_date   timestamptz,
  started_at               timestamptz,
  completed_at             timestamptz,
  delivered_at             timestamptz,
  delivery_mileage         int,
  warranty_period          int,
  cancellation_reason_id   uuid REFERENCES config_categories(id),
  subtotal                 numeric(12,2) NOT NULL DEFAULT 0,
  discount_amount          numeric(12,2) NOT NULL DEFAULT 0,
  tax_amount               numeric(12,2) NOT NULL DEFAULT 0,
  total_amount             numeric(12,2) NOT NULL DEFAULT 0,
  notes                    text,
  created_by               uuid REFERENCES profiles(id),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

CREATE UNIQUE INDEX idx_service_orders_org_number ON service_orders (organization_id, os_number);
CREATE INDEX idx_service_orders_client_id ON service_orders (client_id);
CREATE INDEX idx_service_orders_vehicle_id ON service_orders (vehicle_id);
CREATE INDEX idx_service_orders_status_id ON service_orders (organization_id, status_id, entry_date DESC);
CREATE INDEX idx_service_orders_assigned_to ON service_orders (assigned_to);

CREATE TRIGGER trg_service_orders_updated_at
  BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_service_orders_set_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.os_number IS NULL OR NEW.os_number = '' THEN
    NEW.os_number := fn_next_document_number(NEW.organization_id, 'service_order');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_orders_set_number
  BEFORE INSERT ON service_orders
  FOR EACH ROW EXECUTE FUNCTION fn_service_orders_set_number();

-- NOTA DE ORDEM: as FKs `quotes.converted_to_service_order_id` (Seção 7),
-- `appointments.service_order_id`/`quote_id`/`inspection_id` (Seção 5),
-- `vehicle_inspections.quote_id` (Seção 6) e `vehicle_shop_visits.service_order_id`
-- (Seção 6) formam dependências cíclicas entre quotes/service_orders/appointments/
-- vehicle_inspections. Na migration real, essas tabelas serão criadas SEM as FKs
-- cruzadas e as constraints serão adicionadas via `ALTER TABLE ... ADD CONSTRAINT`
-- em um passo final único (migration 0007, último bloco), após todas as tabelas
-- do núcleo operacional existirem.


-- ---------------------------------------------------------------------------
-- service_order_items (mesma estrutura de quote_items)
-- ---------------------------------------------------------------------------
CREATE TABLE service_order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id  uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  item_type         text NOT NULL CHECK (item_type IN ('service','part','custom')),
  service_id        uuid REFERENCES services(id),
  part_id           uuid REFERENCES parts(id),
  category_id       uuid REFERENCES config_categories(id),
  description       text NOT NULL,
  quantity          numeric(12,2) NOT NULL DEFAULT 1,
  unit_price        numeric(12,2) NOT NULL,
  discount_amount   numeric(12,2) NOT NULL DEFAULT 0,
  total_amount      numeric(12,2) GENERATED ALWAYS AS
                    ((quantity * unit_price) - discount_amount) STORED,
  sort_order        int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_order_items_so ON service_order_items (service_order_id);

CREATE TRIGGER trg_service_order_items_updated_at
  BEFORE UPDATE ON service_order_items
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_recalc_service_order_totals()
RETURNS trigger AS $$
DECLARE
  v_so_id uuid := coalesce(NEW.service_order_id, OLD.service_order_id);
  v_subtotal numeric(12,2);
BEGIN
  SELECT coalesce(sum(total_amount), 0) INTO v_subtotal
  FROM service_order_items WHERE service_order_id = v_so_id;

  UPDATE service_orders SET
    subtotal = v_subtotal,
    total_amount = v_subtotal - discount_amount + tax_amount
  WHERE id = v_so_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_order_items_recalc
  AFTER INSERT OR UPDATE OR DELETE ON service_order_items
  FOR EACH ROW EXECUTE FUNCTION fn_recalc_service_order_totals();


-- ---------------------------------------------------------------------------
-- service_order_checklist_items
-- AJUSTE ETAPA 2: label->description, done->is_completed, + stage_name
-- (mesmo ajuste de inspection_items, Seção 6).
-- ---------------------------------------------------------------------------
CREATE TABLE service_order_checklist_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id  uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  stage_name        text,
  description       text NOT NULL,
  is_completed      boolean NOT NULL DEFAULT false,
  completed_by      uuid REFERENCES profiles(id),
  completed_at      timestamptz,
  sort_order        int NOT NULL DEFAULT 0
);

CREATE INDEX idx_service_order_checklist_so ON service_order_checklist_items (service_order_id);


-- ---------------------------------------------------------------------------
-- service_order_status_history
-- ---------------------------------------------------------------------------
CREATE TABLE service_order_status_history (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id  uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  from_status_id    uuid REFERENCES config_categories(id),
  to_status_id      uuid NOT NULL REFERENCES config_categories(id),
  changed_by        uuid REFERENCES profiles(id),
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_order_status_history_so ON service_order_status_history (service_order_id, created_at DESC);


-- ---------------------------------------------------------------------------
-- service_order_time_logs
-- ---------------------------------------------------------------------------
CREATE TABLE service_order_time_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id  uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES profiles(id),
  started_at        timestamptz NOT NULL,
  ended_at          timestamptz,
  duration_minutes  int GENERATED ALWAYS AS (
                      CASE WHEN ended_at IS NOT NULL
                        THEN round(extract(epoch FROM (ended_at - started_at)) / 60)::int
                        ELSE NULL END
                    ) STORED,
  notes             text
);

CREATE INDEX idx_service_order_time_logs_so ON service_order_time_logs (service_order_id);

-- Fotos/anexos da OS: file_metadata (Seção 11), entity_type='service_order',
-- attachment_type IN ('photo_before','photo_after','document','other').


-- ---------------------------------------------------------------------------
-- fn_sync_shop_visit_stage — sincroniza vehicle_shop_visits.current_stage_id e
-- vehicles.journey_stage_id/journey_stage_updated_at quando o estágio de
-- jornada do veículo muda (chamado por Server Action ao mover o card no
-- Kanban /patio, e por triggers de status de quotes/service_orders quando a
-- mudança de status implica mudança de estágio — ex.: orçamento aprovado ->
-- 'aguardando_inicio').
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_vehicle_journey_stage(p_vehicle_id uuid, p_stage_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE vehicles
  SET journey_stage_id = p_stage_id, journey_stage_updated_at = now()
  WHERE id = p_vehicle_id;

  UPDATE vehicle_shop_visits
  SET current_stage_id = p_stage_id, updated_at = now()
  WHERE vehicle_id = p_vehicle_id AND checked_out_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- SEÇÃO 9 — FINANCEIRO  (Fase 3.8 / migration 0008_financial.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- suppliers
-- ---------------------------------------------------------------------------
CREATE TABLE suppliers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name            text NOT NULL,
  document        text,
  phone           text,
  email           text,
  address         text,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- payment_methods: config_categories.type='payment_method' (sem tabela própria).


-- ---------------------------------------------------------------------------
-- accounts_receivable
-- AJUSTE ETAPA 2: + code (prefixo REC). status mapeado do mock
-- (aberto/parcial/recebido/cancelado -> pending/partially_paid/paid/cancelled);
-- 'overdue' permanece CALCULADO (não persistido) — replica `isOverdue()` do
-- mock via view/RPC `fn_is_overdue(due_date, status)`, em vez de status
-- gravado, evitando jobs de atualização em massa.
-- ---------------------------------------------------------------------------
CREATE TABLE accounts_receivable (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id),
  code             text NOT NULL,
  service_order_id uuid REFERENCES service_orders(id),
  quote_id         uuid REFERENCES quotes(id),
  client_id        uuid NOT NULL REFERENCES clients(id),
  category_id      uuid REFERENCES config_categories(id),
  description      text NOT NULL,
  total_amount     numeric(12,2) NOT NULL,
  issue_date       date NOT NULL DEFAULT current_date,
  due_date         date NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','partially_paid','paid','cancelled')),
  created_by       uuid REFERENCES profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE UNIQUE INDEX idx_accounts_receivable_org_code ON accounts_receivable (organization_id, code);
CREATE INDEX idx_accounts_receivable_client_id ON accounts_receivable (client_id);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable (organization_id, status, due_date);

CREATE TRIGGER trg_accounts_receivable_updated_at
  BEFORE UPDATE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_accounts_receivable_set_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := fn_next_document_number(NEW.organization_id, 'accounts_receivable');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_receivable_set_code
  BEFORE INSERT ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION fn_accounts_receivable_set_code();


-- ---------------------------------------------------------------------------
-- accounts_receivable_payments
-- SUBSTITUI accounts_receivable_installments (AJUSTE ETAPA 2 — decisão
-- pendente nº4 do FASE3_PLANO, aqui resolvida em favor do modelo do mock):
-- 1 linha por PaymentEntry (transação de pagamento real), não por parcela
-- planejada. Suporta reversão/edição granular por pagamento
-- (reverseReceivablePayment/updateReceivablePayment do mock).
-- card_installments = nº de parcelas do CARTÃO (não é "parcela do título").
-- ---------------------------------------------------------------------------
CREATE TABLE accounts_receivable_payments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accounts_receivable_id  uuid NOT NULL REFERENCES accounts_receivable(id) ON DELETE CASCADE,
  method_id               uuid REFERENCES config_categories(id),
  amount                  numeric(12,2) NOT NULL,
  paid_at                 timestamptz NOT NULL DEFAULT now(),
  card_brand              text,
  card_installments       int,
  stage                   text CHECK (stage IN ('orcamento','execucao','entrega','outro')),
  notes                   text,
  reversed_at             timestamptz,
  reversed_by             uuid REFERENCES profiles(id),
  created_by              uuid REFERENCES profiles(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ar_payments_ar_id ON accounts_receivable_payments (accounts_receivable_id);
CREATE INDEX idx_ar_payments_paid_at ON accounts_receivable_payments (paid_at);

CREATE TRIGGER trg_ar_payments_updated_at
  BEFORE UPDATE ON accounts_receivable_payments
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- fn_recalc_receivable_status: soma pagamentos não revertidos e atualiza
-- accounts_receivable.status (pending/partially_paid/paid).
CREATE OR REPLACE FUNCTION fn_recalc_receivable_status()
RETURNS trigger AS $$
DECLARE
  v_ar_id uuid := coalesce(NEW.accounts_receivable_id, OLD.accounts_receivable_id);
  v_total numeric(12,2);
  v_paid  numeric(12,2);
  v_status text;
BEGIN
  SELECT total_amount INTO v_total FROM accounts_receivable WHERE id = v_ar_id;
  SELECT coalesce(sum(amount), 0) INTO v_paid
  FROM accounts_receivable_payments
  WHERE accounts_receivable_id = v_ar_id AND reversed_at IS NULL;

  v_status := CASE
    WHEN v_paid <= 0 THEN 'pending'
    WHEN v_paid < v_total THEN 'partially_paid'
    ELSE 'paid'
  END;

  UPDATE accounts_receivable SET status = v_status WHERE id = v_ar_id AND status <> 'cancelled';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ar_payments_recalc
  AFTER INSERT OR UPDATE OR DELETE ON accounts_receivable_payments
  FOR EACH ROW EXECUTE FUNCTION fn_recalc_receivable_status();


-- ---------------------------------------------------------------------------
-- accounts_payable
-- AJUSTE ETAPA 2: + code (prefixo PAG). supplier_id (FK suppliers, nullable) +
-- payee_name (text livre — cobre "Folha de pagamento", "Receita Federal" etc.,
-- que não são `suppliers` cadastrados). category_id -> config_categories
-- (type=financial_category, 7 valores do mock). status com 5 valores (igual
-- ao schema v1.1 — mais correto que os 3 valores do mock; lógica de
-- partially_paid alinhada via accounts_payable_payments, mesma mecânica de AR).
-- PAYABLE_SUPPLIER_LABEL (label dinâmico do campo "Fornecedor" por categoria,
-- Fase 2B.8 Bloco 26) permanece como mapa em código de aplicação
-- (src/lib/mock-data/financeiro.ts), não migra para coluna de banco.
-- ---------------------------------------------------------------------------
CREATE TABLE accounts_payable (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  code            text NOT NULL,
  supplier_id     uuid REFERENCES suppliers(id),
  payee_name      text,
  category_id     uuid REFERENCES config_categories(id),
  description     text NOT NULL,
  total_amount    numeric(12,2) NOT NULL,
  issue_date      date NOT NULL DEFAULT current_date,
  due_date        date NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','partially_paid','paid','overdue','cancelled')),
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX idx_accounts_payable_org_code ON accounts_payable (organization_id, code);
CREATE INDEX idx_accounts_payable_supplier_id ON accounts_payable (supplier_id);
CREATE INDEX idx_accounts_payable_status ON accounts_payable (organization_id, status, due_date);

CREATE TRIGGER trg_accounts_payable_updated_at
  BEFORE UPDATE ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_accounts_payable_set_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := fn_next_document_number(NEW.organization_id, 'accounts_payable');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_payable_set_code
  BEFORE INSERT ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION fn_accounts_payable_set_code();


-- ---------------------------------------------------------------------------
-- accounts_payable_payments (espelha accounts_receivable_payments, sem card_*)
-- ---------------------------------------------------------------------------
CREATE TABLE accounts_payable_payments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accounts_payable_id  uuid NOT NULL REFERENCES accounts_payable(id) ON DELETE CASCADE,
  method_id            uuid REFERENCES config_categories(id),
  bank_account_id      uuid REFERENCES bank_accounts(id),
  amount               numeric(12,2) NOT NULL,
  paid_at              timestamptz NOT NULL DEFAULT now(),
  notes                text,
  reversed_at          timestamptz,
  reversed_by          uuid REFERENCES profiles(id),
  created_by           uuid REFERENCES profiles(id),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ap_payments_ap_id ON accounts_payable_payments (accounts_payable_id);
CREATE INDEX idx_ap_payments_paid_at ON accounts_payable_payments (paid_at);

CREATE TRIGGER trg_ap_payments_updated_at
  BEFORE UPDATE ON accounts_payable_payments
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_recalc_payable_status()
RETURNS trigger AS $$
DECLARE
  v_ap_id uuid := coalesce(NEW.accounts_payable_id, OLD.accounts_payable_id);
  v_total numeric(12,2);
  v_paid  numeric(12,2);
  v_status text;
BEGIN
  SELECT total_amount INTO v_total FROM accounts_payable WHERE id = v_ap_id;
  SELECT coalesce(sum(amount), 0) INTO v_paid
  FROM accounts_payable_payments
  WHERE accounts_payable_id = v_ap_id AND reversed_at IS NULL;

  v_status := CASE
    WHEN v_paid <= 0 THEN 'pending'
    WHEN v_paid < v_total THEN 'partially_paid'
    ELSE 'paid'
  END;

  UPDATE accounts_payable SET status = v_status WHERE id = v_ap_id AND status NOT IN ('cancelled','overdue');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ap_payments_recalc
  AFTER INSERT OR UPDATE OR DELETE ON accounts_payable_payments
  FOR EACH ROW EXECUTE FUNCTION fn_recalc_payable_status();


-- ---------------------------------------------------------------------------
-- fn_is_overdue — "vencido" calculado (não persistido), replica isOverdue() do
-- mock para uso em filtros/KPIs de contas a receber/pagar.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_is_overdue(p_due_date date, p_status text)
RETURNS boolean AS $$
  SELECT p_due_date < current_date AND p_status NOT IN ('paid','cancelled');
$$ LANGUAGE sql IMMUTABLE;


-- ---------------------------------------------------------------------------
-- cash_flow_entries — VIEW (não tabela física), conforme recomendação do
-- schema v1.1 §7.7: unifica pagamentos recebidos/efetuados não revertidos.
-- ---------------------------------------------------------------------------
CREATE VIEW cash_flow_entries AS
  SELECT
    p.id,
    ar.organization_id,
    'income'::text AS entry_type,
    'accounts_receivable_payments'::text AS reference_table,
    p.id AS reference_id,
    ar.category_id,
    p.amount,
    p.paid_at::date AS entry_date
  FROM accounts_receivable_payments p
  JOIN accounts_receivable ar ON ar.id = p.accounts_receivable_id
  WHERE p.reversed_at IS NULL
  UNION ALL
  SELECT
    p.id,
    ap.organization_id,
    'expense'::text AS entry_type,
    'accounts_payable_payments'::text AS reference_table,
    p.id AS reference_id,
    ap.category_id,
    p.amount,
    p.paid_at::date AS entry_date
  FROM accounts_payable_payments p
  JOIN accounts_payable ap ON ap.id = p.accounts_payable_id
  WHERE p.reversed_at IS NULL;

-- =====================================================================================
-- SEÇÃO 10 — AUDITORIA  (Fase 3.11 / migration 0009_audit.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- entity_events
-- AJUSTE ETAPA 2: entity_type passa de 4 para 11 valores; event_type passa de
-- 7 para 19 valores (lista completa abaixo, alinhada a EntityType/
-- EntityEventType do mock, src/lib/mock-data/entity-events.ts).
-- 'login'/'logout' permanecem fora de entity_events nesta modelagem — vão
-- para audit_logs (ver decisão abaixo); 'password_reset'/'permission_changed'
-- idem. Caso a Fase 3.2/3.11 confirme o caminho inverso (mantê-los aqui, como
-- o mock faz hoje, entity_type='auth'/'user'), basta adicionar
-- 'auth'/'user' a entity_type e os 3 event_types correspondentes — sem
-- mudança estrutural.
-- ---------------------------------------------------------------------------
CREATE TABLE entity_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  entity_type     text NOT NULL CHECK (entity_type IN (
    'client','vehicle','quote','service_order','inspection',
    'receivable','payable','appointment','user','settings','vehicle_shop_visit'
  )),
  entity_id       uuid NOT NULL,
  event_type      text NOT NULL CHECK (event_type IN (
    'created','updated','status_changed','note_added','file_uploaded',
    'appointment_scheduled','converted_to_quote','converted_to_os',
    'payment_received','payment_partial','payment_cancelled','payment_reversed',
    'payment_method_changed','installment_changed','checklist_updated',
    'inactivated','reactivated','deleted','journey_stage_changed'
  )),
  title           text NOT NULL,
  description     text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entity_events_lookup
  ON entity_events (organization_id, entity_type, entity_id, created_at DESC);

-- Espelhamento para timeline do veículo (§7.11.1 do schema v1.1): triggers de
-- vehicle_inspections/quotes/service_orders/appointments (Seções 6-8) também
-- inserem uma cópia com entity_type='vehicle', entity_id=<vehicle_id> e
-- metadata.source_entity_type/source_entity_id apontando para a origem.
-- Implementação dos triggers fica para a migration 0009 (depende de todas as
-- tabelas de negócio já existirem).


-- ---------------------------------------------------------------------------
-- audit_logs
-- AJUSTE ETAPA 2: action ganha 'password_reset' e 'permission_changed' —
-- destino recomendado para os eventos de auth/segurança hoje gravados como
-- EntityEvent no mock (entity_type='auth'/'user').
-- ---------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_id     uuid REFERENCES profiles(id),
  user_email  text,
  ip_address  inet,
  module      text NOT NULL,
  entity_id   uuid,
  action      text NOT NULL CHECK (action IN (
    'login','logout','create','update','delete',
    'password_reset','permission_changed'
  )),
  changes     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_module ON audit_logs (organization_id, module);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs (entity_id);

-- Sem policy de UPDATE/DELETE: append-only (ver Seção 12 — RLS).


-- ---------------------------------------------------------------------------
-- financial_audit_logs — hash-chain append-only
-- ---------------------------------------------------------------------------
CREATE TABLE financial_audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  table_name      text NOT NULL,
  record_id       uuid NOT NULL,
  action          text NOT NULL CHECK (action IN ('insert','update','delete')),
  changed_by      uuid REFERENCES profiles(id),
  changed_at      timestamptz NOT NULL DEFAULT now(),
  old_data        jsonb,
  new_data        jsonb,
  previous_hash   text NOT NULL,
  record_hash     text NOT NULL
);

CREATE INDEX idx_financial_audit_org_table_record
  ON financial_audit_logs (organization_id, table_name, record_id, changed_at);

-- Revoga UPDATE/DELETE de todos os papéis de aplicação — somente INSERT via
-- trigger SECURITY DEFINER (fn_financial_audit_trigger), nem mesmo
-- Administrador pode alterar/apagar pela API.
REVOKE UPDATE, DELETE ON financial_audit_logs FROM PUBLIC, authenticated;

CREATE OR REPLACE FUNCTION fn_financial_audit_trigger()
RETURNS trigger AS $$
DECLARE
  v_org_id        uuid;
  v_previous_hash text;
  v_record_hash   text;
  v_old           jsonb := NULL;
  v_new           jsonb := NULL;
BEGIN
  v_org_id := coalesce(NEW.organization_id,
    (SELECT organization_id FROM accounts_receivable WHERE id = OLD.accounts_receivable_id),
    (SELECT organization_id FROM accounts_payable WHERE id = OLD.accounts_payable_id));

  IF TG_OP IN ('UPDATE','DELETE') THEN v_old := to_jsonb(OLD); END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN v_new := to_jsonb(NEW); END IF;

  SELECT record_hash INTO v_previous_hash
  FROM financial_audit_logs
  WHERE organization_id = v_org_id
  ORDER BY changed_at DESC LIMIT 1;

  v_previous_hash := coalesce(v_previous_hash, '');
  v_record_hash := encode(sha256((v_previous_hash || coalesce(v_new, v_old)::text)::bytea), 'hex');

  INSERT INTO financial_audit_logs (
    organization_id, table_name, record_id, action, changed_by,
    old_data, new_data, previous_hash, record_hash
  ) VALUES (
    v_org_id, TG_TABLE_NAME, coalesce(NEW.id, OLD.id), lower(TG_OP), auth.uid(),
    v_old, v_new, v_previous_hash, v_record_hash
  );

  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_financial_audit_ar
  AFTER INSERT OR UPDATE OR DELETE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION fn_financial_audit_trigger();
CREATE TRIGGER trg_financial_audit_ar_payments
  AFTER INSERT OR UPDATE OR DELETE ON accounts_receivable_payments
  FOR EACH ROW EXECUTE FUNCTION fn_financial_audit_trigger();
CREATE TRIGGER trg_financial_audit_ap
  AFTER INSERT OR UPDATE OR DELETE ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION fn_financial_audit_trigger();
CREATE TRIGGER trg_financial_audit_ap_payments
  AFTER INSERT OR UPDATE OR DELETE ON accounts_payable_payments
  FOR EACH ROW EXECUTE FUNCTION fn_financial_audit_trigger();

-- =====================================================================================
-- SEÇÃO 11 — STORAGE  (Fase 3.11-3.12 / migration 0010_storage_policies.sql)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- file_metadata
-- AJUSTE ETAPA 2: attachment_type ganha 'photo_general' (mapeia
-- Attachment.tag='geral' do mock, além de 'photo_before'/'photo_after'/
-- 'document'/'other'). entity_type ganha 'organization' (para
-- logo/assinatura/carimbo da empresa — ver CompanyInfo abaixo).
-- ---------------------------------------------------------------------------
CREATE TABLE file_metadata (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  bucket          text NOT NULL CHECK (bucket IN (
    'avatars','vehicle-photos','vehicle-documents','service-order-attachments',
    'quote-attachments','generated-pdfs','company-assets'
  )),
  file_path       text NOT NULL,
  file_name       text NOT NULL,
  mime_type       text,
  size_bytes      bigint,
  entity_type     text NOT NULL CHECK (entity_type IN (
    'vehicle','service_order','quote','inspection','client','profile','organization'
  )),
  entity_id       uuid NOT NULL,
  attachment_type text CHECK (attachment_type IN (
    'photo','photo_before','photo_after','photo_general','document','other'
  )),
  description     text,
  uploaded_by     uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX idx_file_metadata_entity
  ON file_metadata (organization_id, entity_type, entity_id);

-- Convenção de path: {bucket}/{organization_id}/{entity_type}/{entity_id}/{uuid}-{filename}

-- ---------------------------------------------------------------------------
-- organizations.settings (jsonb) — CompanyInfo / DocumentSettings
-- AJUSTE ETAPA 2: companyInfo (11 campos) e documentSettings (4 campos) do
-- mock NÃO viram tabelas — armazenados em organizations.settings (jsonb),
-- já previsto no schema v1.1 para "logo, cores, fuso horário etc.". Estrutura
-- esperada (validada via Zod na camada de aplicação, não via CHECK no jsonb):
--
-- settings.company = {
--   legal_name, fantasy_name, document, phone, email, address, city, state,
--   zip_code,
--   logo_file_id    uuid -> file_metadata.id (entity_type='organization', bucket='company-assets'),
--   signature_file_id uuid -> file_metadata.id,
--   stamp_file_id   uuid -> file_metadata.id
-- }
-- settings.documents = {
--   quote_validity_days, default_warranty_period_days,
--   quote_terms_text, service_order_terms_text
-- }
--
-- Migração: logoUrl/signatureUrl/stampUrl (URLs brutas no mock) -> upload para
-- bucket 'company-assets' + registro em file_metadata + referência por id em
-- settings.company.*_file_id.

-- Buckets a criar via Supabase Storage (migration 0010, supabase/config.toml já
-- habilita storage): avatars, vehicle-photos, vehicle-documents,
-- service-order-attachments, quote-attachments, generated-pdfs, company-assets.
-- 'generated-pdfs': PDFs continuam gerados client-side via jsPDF na Fase 3
-- (decisão ETAPA 6) — bucket reservado para uso futuro (download/histórico),
-- sem Edge Function nesta fase.

-- Storage RLS policies (aplicadas via supabase/migrations, sintaxe
-- storage.objects) seguem o padrão:
--   path = {bucket}/{organization_id}/{entity_type}/{entity_id}/...
--   USING ( (storage.foldername(name))[1] = fn_current_org_id()::text
--           AND fn_has_permission('<modulo_correspondente>','view'|'create'|...) )
-- onde <modulo_correspondente> é: avatars->usuarios, vehicle-photos/
-- vehicle-documents->veiculos, service-order-attachments->ordens_servico,
-- quote-attachments->orcamentos, company-assets->configuracoes,
-- generated-pdfs->o módulo da entidade referenciada.

-- =====================================================================================
-- SEÇÃO 12 — FKs CRUZADAS, RLS PADRÃO CONSOLIDADO E AJUSTES FINAIS
-- (fecha as migrations 0005-0010)
-- =====================================================================================

-- ---------------------------------------------------------------------------
-- 12.1 — FKs cruzadas (dependências cíclicas entre agenda/vistorias/orçamentos/
-- OS/pátio) adicionadas após todas as tabelas existirem.
-- ---------------------------------------------------------------------------
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_inspection FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id),
  ADD CONSTRAINT fk_appointments_quote FOREIGN KEY (quote_id) REFERENCES quotes(id),
  ADD CONSTRAINT fk_appointments_service_order FOREIGN KEY (service_order_id) REFERENCES service_orders(id);

ALTER TABLE vehicle_inspections
  ADD CONSTRAINT fk_inspections_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  ADD CONSTRAINT fk_inspections_quote FOREIGN KEY (quote_id) REFERENCES quotes(id);

ALTER TABLE vehicle_shop_visits
  ADD CONSTRAINT fk_shop_visits_service_order FOREIGN KEY (service_order_id) REFERENCES service_orders(id),
  ADD CONSTRAINT fk_shop_visits_inspection FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id);

ALTER TABLE quotes
  ADD CONSTRAINT fk_quotes_converted_so FOREIGN KEY (converted_to_service_order_id) REFERENCES service_orders(id);


-- ---------------------------------------------------------------------------
-- 12.2 — RLS padrão por módulo
-- Template (ver docs/ARCHITECTURE.md §7.9):
--   SELECT: deleted_at IS NULL AND organization_id = fn_current_org_id()
--           AND fn_has_permission(module,'view')
--   INSERT: organization_id = fn_current_org_id() AND fn_has_permission(module,'create')
--   UPDATE: idem 'edit' (soft delete = UPDATE deleted_at, autorizado por 'delete')
--   DELETE físico: bloqueado (USING false)
--
-- Aplicado via DO block parametrizado por (tabela, módulo) para as tabelas com
-- organization_id direto. Tabelas sem organization_id próprio (itens/sub-linhas)
-- herdam a permissão do pai via policy dedicada (12.3).
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT * FROM (VALUES
    ('config_categories','configuracoes'),
    ('services','configuracoes'),
    ('parts','configuracoes'),
    ('checklist_templates','configuracoes'),
    ('bank_accounts','configuracoes'),
    ('clients','clientes'),
    ('vehicles','veiculos'),
    ('appointments','agenda'),
    ('vehicle_inspections','vistorias'),
    ('vehicle_shop_visits','ordens_servico'),
    ('quotes','orcamentos'),
    ('service_orders','ordens_servico'),
    ('suppliers','financeiro'),
    ('accounts_receivable','financeiro'),
    ('accounts_payable','financeiro')
  ) AS x(table_name, module)
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t.table_name);

    EXECUTE format($f$
      CREATE POLICY "select_%1$s" ON %1$I FOR SELECT
      USING (deleted_at IS NULL AND organization_id = fn_current_org_id() AND fn_has_permission('%2$s','view'))
    $f$, t.table_name, t.module);

    EXECUTE format($f$
      CREATE POLICY "insert_%1$s" ON %1$I FOR INSERT
      WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission('%2$s','create'))
    $f$, t.table_name, t.module);

    EXECUTE format($f$
      CREATE POLICY "update_%1$s" ON %1$I FOR UPDATE
      USING (organization_id = fn_current_org_id() AND fn_has_permission('%2$s','edit'))
      WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission('%2$s','edit'))
    $f$, t.table_name, t.module);

    EXECUTE format('CREATE POLICY "delete_%1$s" ON %1$I FOR DELETE USING (false)', t.table_name);
  END LOOP;
END $$;

-- Leitura aberta de taxonomias/catálogos a qualquer autenticado (necessária
-- para popular selects em orçamento/OS/agenda/financeiro, mesmo sem
-- permissão em 'configuracoes'):
CREATE POLICY "select_config_categories_any" ON config_categories FOR SELECT
  USING (deleted_at IS NULL AND organization_id = fn_current_org_id() AND is_active AND auth.role() = 'authenticated');
CREATE POLICY "select_services_any" ON services FOR SELECT
  USING (deleted_at IS NULL AND organization_id = fn_current_org_id() AND is_active AND auth.role() = 'authenticated');
CREATE POLICY "select_parts_any" ON parts FOR SELECT
  USING (deleted_at IS NULL AND organization_id = fn_current_org_id() AND is_active AND auth.role() = 'authenticated');
-- checklist_templates: leitura também para vistorias.view / ordens_servico.view
CREATE POLICY "select_checklist_templates_consumers" ON checklist_templates FOR SELECT
  USING (deleted_at IS NULL AND organization_id = fn_current_org_id()
         AND (fn_has_permission('vistorias','view') OR fn_has_permission('ordens_servico','view')));


-- ---------------------------------------------------------------------------
-- 12.3 — RLS de tabelas-filhas (herdam permissão do pai via EXISTS)
-- ---------------------------------------------------------------------------
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_quote_items" ON quote_items FOR ALL
  USING (EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_id AND q.organization_id = fn_current_org_id() AND fn_has_permission('orcamentos','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_id AND q.organization_id = fn_current_org_id() AND fn_has_permission('orcamentos','edit')));

CREATE POLICY "all_quote_status_history" ON quote_status_history FOR ALL
  USING (EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_id AND q.organization_id = fn_current_org_id() AND fn_has_permission('orcamentos','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM quotes q WHERE q.id = quote_id AND q.organization_id = fn_current_org_id() AND fn_has_permission('orcamentos','edit')));

CREATE POLICY "all_service_order_items" ON service_order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','edit')));

CREATE POLICY "all_service_order_checklist_items" ON service_order_checklist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','edit')));

CREATE POLICY "all_service_order_status_history" ON service_order_status_history FOR ALL
  USING (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','edit')));

CREATE POLICY "all_service_order_time_logs" ON service_order_time_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM service_orders so WHERE so.id = service_order_id AND so.organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','edit')));

CREATE POLICY "all_inspection_items" ON inspection_items FOR ALL
  USING (EXISTS (SELECT 1 FROM vehicle_inspections vi WHERE vi.id = inspection_id AND vi.organization_id = fn_current_org_id() AND fn_has_permission('vistorias','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM vehicle_inspections vi WHERE vi.id = inspection_id AND vi.organization_id = fn_current_org_id() AND fn_has_permission('vistorias','edit')));

CREATE POLICY "all_ar_payments" ON accounts_receivable_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM accounts_receivable ar WHERE ar.id = accounts_receivable_id AND ar.organization_id = fn_current_org_id() AND fn_has_permission('financeiro','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM accounts_receivable ar WHERE ar.id = accounts_receivable_id AND ar.organization_id = fn_current_org_id() AND fn_has_permission('financeiro','financial')));

CREATE POLICY "all_ap_payments" ON accounts_payable_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM accounts_payable ap WHERE ap.id = accounts_payable_id AND ap.organization_id = fn_current_org_id() AND fn_has_permission('financeiro','view')))
  WITH CHECK (EXISTS (SELECT 1 FROM accounts_payable ap WHERE ap.id = accounts_payable_id AND ap.organization_id = fn_current_org_id() AND fn_has_permission('financeiro','financial')));

CREATE POLICY "all_checklist_template_stages" ON checklist_template_stages FOR ALL
  USING (EXISTS (SELECT 1 FROM checklist_templates ct WHERE ct.id = template_id AND ct.organization_id = fn_current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM checklist_templates ct WHERE ct.id = template_id AND ct.organization_id = fn_current_org_id() AND fn_has_permission('configuracoes','edit')));

CREATE POLICY "all_checklist_template_items" ON checklist_template_items FOR ALL
  USING (EXISTS (SELECT 1 FROM checklist_template_stages s JOIN checklist_templates ct ON ct.id = s.template_id WHERE s.id = stage_id AND ct.organization_id = fn_current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM checklist_template_stages s JOIN checklist_templates ct ON ct.id = s.template_id WHERE s.id = stage_id AND ct.organization_id = fn_current_org_id() AND fn_has_permission('configuracoes','edit')));


-- ---------------------------------------------------------------------------
-- 12.4 — RLS de entity_events, audit_logs, financial_audit_logs, file_metadata
-- ---------------------------------------------------------------------------
ALTER TABLE entity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- entity_events: leitura conforme o módulo do entity_type de origem
CREATE OR REPLACE FUNCTION fn_module_for_entity_type(p_entity_type text)
RETURNS text AS $$
  SELECT CASE p_entity_type
    WHEN 'client' THEN 'clientes'
    WHEN 'vehicle' THEN 'veiculos'
    WHEN 'vehicle_shop_visit' THEN 'ordens_servico'
    WHEN 'quote' THEN 'orcamentos'
    WHEN 'service_order' THEN 'ordens_servico'
    WHEN 'inspection' THEN 'vistorias'
    WHEN 'receivable' THEN 'financeiro'
    WHEN 'payable' THEN 'financeiro'
    WHEN 'appointment' THEN 'agenda'
    WHEN 'user' THEN 'usuarios'
    WHEN 'settings' THEN 'configuracoes'
  END;
$$ LANGUAGE sql IMMUTABLE;

CREATE POLICY "select_entity_events" ON entity_events FOR SELECT
  USING (organization_id = fn_current_org_id() AND fn_has_permission(fn_module_for_entity_type(entity_type), 'view'));
-- INSERT: somente via Server Action/trigger (SECURITY DEFINER) — sem policy de INSERT para `authenticated`.

-- audit_logs / financial_audit_logs: append-only, leitura por 'auditoria.view'
CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
  USING (organization_id = fn_current_org_id() AND fn_has_permission('auditoria','view'));
CREATE POLICY "select_financial_audit_logs" ON financial_audit_logs FOR SELECT
  USING (organization_id = fn_current_org_id() AND fn_has_permission('auditoria','view'));
-- Sem policies de INSERT para `authenticated`: audit_logs recebe inserts via
-- Server Action (service role); financial_audit_logs apenas via trigger
-- SECURITY DEFINER (fn_financial_audit_trigger).

-- file_metadata: leitura/escrita conforme módulo do entity_type
CREATE OR REPLACE FUNCTION fn_module_for_file_entity_type(p_entity_type text)
RETURNS text AS $$
  SELECT CASE p_entity_type
    WHEN 'vehicle' THEN 'veiculos'
    WHEN 'service_order' THEN 'ordens_servico'
    WHEN 'quote' THEN 'orcamentos'
    WHEN 'inspection' THEN 'vistorias'
    WHEN 'client' THEN 'clientes'
    WHEN 'profile' THEN 'usuarios'
    WHEN 'organization' THEN 'configuracoes'
  END;
$$ LANGUAGE sql IMMUTABLE;

CREATE POLICY "select_file_metadata" ON file_metadata FOR SELECT
  USING (deleted_at IS NULL AND organization_id = fn_current_org_id() AND fn_has_permission(fn_module_for_file_entity_type(entity_type), 'view'));
CREATE POLICY "insert_file_metadata" ON file_metadata FOR INSERT
  WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission(fn_module_for_file_entity_type(entity_type), 'create'));
CREATE POLICY "update_file_metadata" ON file_metadata FOR UPDATE
  USING (organization_id = fn_current_org_id() AND fn_has_permission(fn_module_for_file_entity_type(entity_type), 'delete'))
  WITH CHECK (organization_id = fn_current_org_id());


-- ---------------------------------------------------------------------------
-- 12.5 — fn_log_entity_event (gatilho genérico de timeline)
-- Implementação detalhada (triggers por tabela + espelhamento para
-- entity_type='vehicle') fica para a migration 0009 — assinatura e
-- contrato apresentados aqui para validação do modelo.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_log_entity_event(
  p_entity_type text, p_entity_id uuid, p_event_type text,
  p_title text, p_description text DEFAULT NULL, p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO entity_events (organization_id, entity_type, entity_id, event_type, title, description, metadata, created_by)
  VALUES (fn_current_org_id(), p_entity_type, p_entity_id, p_event_type, p_title, p_description, p_metadata, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- FIM DO SCHEMA (Seções 1-12). Aguardando aprovação para:
--   (a) split em supabase/migrations/0001-0010 (+ seeds completos de
--       config_categories/role_permissions citados como "NOTA" nas Seções 2-3),
--   (b) início da Fase 3.1 (extensões/helpers, migration 0001).
-- =====================================================================================
