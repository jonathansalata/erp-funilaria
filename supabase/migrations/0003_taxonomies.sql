-- =============================================================================
-- Migration: 0003_taxonomies.sql
-- Descrição: Taxonomias globais (config_categories), catálogos (services/parts),
--            templates de checklist, contas bancárias e numeração de documentos.
-- Referência: docs/FASE3_SCHEMA.sql (Seção 3), docs/ARCHITECTURE.md (seção 7)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- config_categories
-- `code` é imutável (chave de negócio, equivalente a StatusConfig.key do mock).
-- `name`/`normalized_name` são editáveis pelo usuário.
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
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
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

-- ---------------------------------------------------------------------------
-- Seeds — taxonomias de sistema (status) e catálogos padrão (src/lib/mock-data/*)
-- ---------------------------------------------------------------------------

-- quote_status
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','quote_status','rascunho','Em elaboração',true,0),
  ('00000000-0000-0000-0000-000000000001','quote_status','enviado','Enviado',true,1),
  ('00000000-0000-0000-0000-000000000001','quote_status','em_negociacao','Em negociação',true,2),
  ('00000000-0000-0000-0000-000000000001','quote_status','aprovado','Aprovado',true,3),
  ('00000000-0000-0000-0000-000000000001','quote_status','reprovado','Reprovado',true,4),
  ('00000000-0000-0000-0000-000000000001','quote_status','cancelado','Cancelado',true,5);

-- service_order_status
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','service_order_status','aberta','Aberta',true,0),
  ('00000000-0000-0000-0000-000000000001','service_order_status','em_andamento','Em andamento',true,1),
  ('00000000-0000-0000-0000-000000000001','service_order_status','aguardando_peca','Aguardando peça',true,2),
  ('00000000-0000-0000-0000-000000000001','service_order_status','pausada','Pausada',true,3),
  ('00000000-0000-0000-0000-000000000001','service_order_status','concluida','Concluída',true,4),
  ('00000000-0000-0000-0000-000000000001','service_order_status','entregue','Entregue',true,5),
  ('00000000-0000-0000-0000-000000000001','service_order_status','cancelada','Cancelada',true,6);

-- vehicle_journey_stage (Kanban /patio, 8 estágios)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_vistoria','Aguardando vistoria',true,0),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','em_vistoria','Em vistoria',true,1),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_aprovacao','Aguardando aprovação',true,2),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_inicio','Aguardando início',true,3),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','em_execucao','Em execução',true,4),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','aguardando_peca','Aguardando peça',true,5),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','pronto_para_retirada','Pronto para retirada',true,6),
  ('00000000-0000-0000-0000-000000000001','vehicle_journey_stage','entregue','Entregue',true,7);

-- appointment_type
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','appointment_type','vistoria','Vistoria',true,0),
  ('00000000-0000-0000-0000-000000000001','appointment_type','entrega','Entrega',true,1),
  ('00000000-0000-0000-0000-000000000001','appointment_type','retorno','Retorno',true,2),
  ('00000000-0000-0000-0000-000000000001','appointment_type','atendimento','Atendimento',true,3),
  ('00000000-0000-0000-0000-000000000001','appointment_type','outros','Outros',true,4);

-- payment_method (src/lib/mock-data/financeiro.ts)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','payment_method','pix','PIX',true,0),
  ('00000000-0000-0000-0000-000000000001','payment_method','dinheiro','Dinheiro',true,1),
  ('00000000-0000-0000-0000-000000000001','payment_method','cartao_debito','Cartão Débito',true,2),
  ('00000000-0000-0000-0000-000000000001','payment_method','cartao_credito','Cartão Crédito',true,3),
  ('00000000-0000-0000-0000-000000000001','payment_method','transferencia','Transferência',true,4),
  ('00000000-0000-0000-0000-000000000001','payment_method','boleto','Boleto',true,5),
  ('00000000-0000-0000-0000-000000000001','payment_method','cheque','Cheque',true,6),
  ('00000000-0000-0000-0000-000000000001','payment_method','outros','Outros',true,7);

-- service_category (src/lib/mock-data/settings.ts DEFAULT_SERVICES)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','service_category','svc-001','Funilaria',false,0),
  ('00000000-0000-0000-0000-000000000001','service_category','svc-002','Pintura',false,1),
  ('00000000-0000-0000-0000-000000000001','service_category','svc-003','Polimento',false,2),
  ('00000000-0000-0000-0000-000000000001','service_category','svc-004','Martelinho de ouro',false,3),
  ('00000000-0000-0000-0000-000000000001','service_category','svc-005','Higienização',false,4),
  ('00000000-0000-0000-0000-000000000001','service_category','svc-006','Outros',false,5);

-- part_category (src/lib/mock-data/settings.ts DEFAULT_CATEGORIES)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','part_category','cat-001','Peças',false,0),
  ('00000000-0000-0000-0000-000000000001','part_category','cat-002','Mão de obra',false,1),
  ('00000000-0000-0000-0000-000000000001','part_category','cat-003','Terceiros',false,2),
  ('00000000-0000-0000-0000-000000000001','part_category','cat-004','Materiais de consumo',false,3);

-- financial_category (src/lib/mock-data/financeiro.ts PayableCategory)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','financial_category','fornecedores','Fornecedores',false,0),
  ('00000000-0000-0000-0000-000000000001','financial_category','salarios','Salários',false,1),
  ('00000000-0000-0000-0000-000000000001','financial_category','aluguel','Aluguel',false,2),
  ('00000000-0000-0000-0000-000000000001','financial_category','utilidades','Utilidades',false,3),
  ('00000000-0000-0000-0000-000000000001','financial_category','impostos','Impostos',false,4),
  ('00000000-0000-0000-0000-000000000001','financial_category','manutencao','Manutenção',false,5),
  ('00000000-0000-0000-0000-000000000001','financial_category','outros','Outros',false,6);

-- cost_center (src/lib/mock-data/settings.ts DEFAULT_COST_CENTERS)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','cost_center','cc-001','Operacional',false,0),
  ('00000000-0000-0000-0000-000000000001','cost_center','cc-002','Administrativo',false,1),
  ('00000000-0000-0000-0000-000000000001','cost_center','cc-003','Marketing',false,2),
  ('00000000-0000-0000-0000-000000000001','cost_center','cc-004','Oficina',false,3),
  ('00000000-0000-0000-0000-000000000001','cost_center','cc-005','Outros',false,4);

-- team (src/lib/mock-data/settings.ts DEFAULT_TEAMS)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','team','team-001','Equipe Funilaria A',false,0),
  ('00000000-0000-0000-0000-000000000001','team','team-002','Equipe Pintura A',false,1),
  ('00000000-0000-0000-0000-000000000001','team','team-003','Equipe Higienização',false,2);

-- cancellation_reason (src/lib/mock-data/settings.ts DEFAULT_CANCELLATION_REASONS)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','cancellation_reason','canc-001','Cliente desistiu do serviço',false,0),
  ('00000000-0000-0000-0000-000000000001','cancellation_reason','canc-002','Cliente optou por outra oficina',false,1),
  ('00000000-0000-0000-0000-000000000001','cancellation_reason','canc-003','Erro de cadastro',false,2),
  ('00000000-0000-0000-0000-000000000001','cancellation_reason','canc-004','Duplicidade de registro',false,3);

-- refusal_reason (src/lib/mock-data/settings.ts DEFAULT_REFUSAL_REASONS)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','refusal_reason','ref-001','Preço acima do esperado',false,0),
  ('00000000-0000-0000-0000-000000000001','refusal_reason','ref-002','Cliente utilizará seguro próprio',false,1),
  ('00000000-0000-0000-0000-000000000001','refusal_reason','ref-003','Prazo de entrega incompatível',false,2),
  ('00000000-0000-0000-0000-000000000001','refusal_reason','ref-004','Cliente não retornou contato',false,3);

-- observation_template (src/lib/mock-data/settings.ts DEFAULT_OBSERVATION_TEMPLATES)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','observation_template','obs-001','Veículo recebido com tanque reserva.',false,0),
  ('00000000-0000-0000-0000-000000000001','observation_template','obs-002','Avarias pré-existentes registradas na vistoria inicial.',false,1),
  ('00000000-0000-0000-0000-000000000001','observation_template','obs-003','Cliente solicitou contato antes de iniciar o serviço.',false,2),
  ('00000000-0000-0000-0000-000000000001','observation_template','obs-004','Peça sob encomenda — prazo sujeito à disponibilidade do fornecedor.',false,3);

-- vehicle_fuel_type (src/lib/mock-data/vehicles.ts FUEL_TYPE_LABELS)
INSERT INTO config_categories (organization_id, type, code, name, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','flex','Flex',true,0),
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','gasolina','Gasolina',true,1),
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','etanol','Etanol',true,2),
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','diesel','Diesel',true,3),
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','eletrico','Elétrico',true,4),
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','hibrido','Híbrido',true,5),
  ('00000000-0000-0000-0000-000000000001','vehicle_fuel_type','gnv','GNV',true,6);

-- maintenance_category e service_type: tipos previstos no CHECK para uso futuro
-- (sem registros do mock atual). Criados ad-hoc em Configurações quando necessário.


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
  deleted_at                  timestamptz,
  deleted_by                  uuid REFERENCES profiles(id)
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
  deleted_at       timestamptz,
  deleted_by       uuid REFERENCES profiles(id)
);

CREATE UNIQUE INDEX idx_parts_category_normalized
  ON parts (category_id, normalized_name) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_parts_updated_at
  BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- checklist_templates / checklist_template_stages / checklist_template_items
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
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
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


-- ---------------------------------------------------------------------------
-- bank_accounts
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
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
);

CREATE TRIGGER trg_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- document_sequences + fn_next_document_number
-- Concorrência: a linha da sequência é bloqueada via `SELECT ... FOR UPDATE`
-- dentro da mesma transação do INSERT/UPDATE que a invoca (trigger
-- BEFORE INSERT), garantindo que duas transações concorrentes não obtenham o
-- mesmo número — a segunda aguarda o lock da primeira ser liberado no commit.
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

  -- Lock da linha da sequência (ou criação) garante atomicidade entre
  -- transações concorrentes: a segunda transação bloqueia em FOR UPDATE até
  -- a primeira commitar/abortar.
  SELECT id, last_number INTO v_seq_id, v_last_number
  FROM document_sequences
  WHERE organization_id = p_org AND entity_type = p_entity_type
    AND (year = v_year OR (year IS NULL AND v_year IS NULL))
  FOR UPDATE;

  IF v_seq_id IS NULL THEN
    INSERT INTO document_sequences (organization_id, entity_type, year, prefix, last_number)
    VALUES (p_org, p_entity_type, v_year, v_prefix, 1)
    ON CONFLICT (organization_id, entity_type, year)
    DO UPDATE SET last_number = document_sequences.last_number + 1
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
