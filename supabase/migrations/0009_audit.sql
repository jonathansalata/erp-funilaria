-- =============================================================================
-- Migration: 0009_audit.sql
-- Descrição: Timeline de eventos (entity_events), auditoria técnica
--            (audit_logs) e auditoria financeira append-only com hash-chain
--            (financial_audit_logs).
-- Referência: docs/FASE3_SCHEMA.sql (Seção 10), docs/ARCHITECTURE.md (seção 7)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- entity_events
-- 'login'/'logout'/'password_reset'/'permission_changed' ficam em audit_logs.
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

-- Espelhamento para timeline do veículo (vehicle_inspections/quotes/
-- service_orders/appointments também inserem uma cópia com
-- entity_type='vehicle', entity_id=<vehicle_id> e
-- metadata.source_entity_type/source_entity_id apontando para a origem) é
-- implementado na camada de aplicação (Server Actions), via
-- fn_log_entity_event (migration 0010).


-- ---------------------------------------------------------------------------
-- audit_logs
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

-- Sem policy de UPDATE/DELETE: append-only (RLS na migration 0010).


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

-- Fase 3.1.2 (Bloco 33): accounts_receivable_payments/accounts_payable_payments
-- não têm coluna organization_id. PL/pgSQL resolve os campos de NEW/OLD em
-- relação ao row-type real da tabela do trigger apenas na primeira execução
-- de cada statement (compilação tardia) — por isso a resolução de v_org_id
-- é ramificada por TG_TABLE_NAME: o branch que referencia
-- NEW.organization_id/OLD.organization_id nunca é executado (logo nunca
-- compilado) para as tabelas de pagamento, evitando o erro
-- "record 'new'/'old' has no field 'organization_id'".
CREATE OR REPLACE FUNCTION fn_financial_audit_trigger()
RETURNS trigger AS $$
DECLARE
  v_org_id        uuid;
  v_previous_hash text;
  v_record_hash   text;
  v_old           jsonb := NULL;
  v_new           jsonb := NULL;
BEGIN
  IF TG_TABLE_NAME IN ('accounts_receivable','accounts_payable') THEN
    v_org_id := coalesce(NEW.organization_id, OLD.organization_id);
  ELSIF TG_TABLE_NAME = 'accounts_receivable_payments' THEN
    SELECT organization_id INTO v_org_id FROM accounts_receivable
    WHERE id = coalesce(NEW.accounts_receivable_id, OLD.accounts_receivable_id);
  ELSIF TG_TABLE_NAME = 'accounts_payable_payments' THEN
    SELECT organization_id INTO v_org_id FROM accounts_payable
    WHERE id = coalesce(NEW.accounts_payable_id, OLD.accounts_payable_id);
  END IF;

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
