-- =============================================================================
-- Migration: 0006_quotes.sql
-- Descrição: Orçamentos (quotes), itens de orçamento e histórico de status.
-- Referência: docs/FASE3_SCHEMA.sql (Seção 7), docs/ARCHITECTURE.md (seção 7)
--
-- NOTA: quotes.converted_to_service_order_id referencia service_orders (criada
-- na migration 0007). Coluna criada aqui sem FK; constraint adicionada via
-- ALTER TABLE no final da migration 0007.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- quotes
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
  converted_to_service_order_id   uuid,  -- FK -> service_orders(id), adicionada na migration 0007
  created_by                      uuid REFERENCES profiles(id),
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now(),
  deleted_at                      timestamptz,
  deleted_by                      uuid REFERENCES profiles(id)
);

CREATE UNIQUE INDEX idx_quotes_org_number ON quotes (organization_id, quote_number);
CREATE INDEX idx_quotes_client_id ON quotes (client_id);
CREATE INDEX idx_quotes_vehicle_id ON quotes (vehicle_id);
CREATE INDEX idx_quotes_status_id ON quotes (organization_id, status_id, issue_date DESC);
CREATE INDEX idx_quotes_converted_so ON quotes (converted_to_service_order_id);

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

-- Anexos do orçamento: file_metadata (migration 0010), entity_type='quote'.
