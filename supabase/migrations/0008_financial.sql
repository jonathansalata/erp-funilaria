-- =============================================================================
-- Migration: 0008_financial.sql
-- Descrição: Fornecedores, contas a receber/pagar (com pagamentos granulares),
--            fluxo de caixa (view) e cálculo de "vencido".
-- Referência: docs/FASE3_SCHEMA.sql (Seção 9), docs/ARCHITECTURE.md (seção 7)
-- =============================================================================

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
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
);

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- payment_methods: config_categories.type='payment_method' (sem tabela própria).


-- ---------------------------------------------------------------------------
-- accounts_receivable
-- 'overdue' é CALCULADO (não persistido) via fn_is_overdue(due_date, status).
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
  deleted_at       timestamptz,
  deleted_by       uuid REFERENCES profiles(id)
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
-- 1 linha por transação de pagamento real (não por parcela planejada).
-- Suporta reversão/edição granular por pagamento.
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
-- supplier_id (FK suppliers, nullable) + payee_name (text livre — cobre
-- "Folha de pagamento", "Receita Federal" etc., que não são suppliers
-- cadastrados). category_id -> config_categories (type=financial_category).
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
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
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
-- fn_is_overdue — "vencido" calculado (não persistido)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_is_overdue(p_due_date date, p_status text)
RETURNS boolean AS $$
  SELECT p_due_date < current_date AND p_status NOT IN ('paid','cancelled');
$$ LANGUAGE sql IMMUTABLE;


-- ---------------------------------------------------------------------------
-- cash_flow_entries — VIEW (não tabela física): unifica pagamentos
-- recebidos/efetuados não revertidos.
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
