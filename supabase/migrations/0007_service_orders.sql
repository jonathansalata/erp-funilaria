-- =============================================================================
-- Migration: 0007_service_orders.sql
-- Descrição: Ordens de serviço (OS), itens, checklist, histórico de status,
--            apontamento de horas, sincronização da jornada do veículo, e
--            FKs cruzadas adiadas das migrations 0005/0006.
-- Referência: docs/FASE3_SCHEMA.sql (Seção 8 + 12.1), docs/ARCHITECTURE.md (seção 7)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- service_orders
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
  deleted_at               timestamptz,
  deleted_by               uuid REFERENCES profiles(id)
);

CREATE UNIQUE INDEX idx_service_orders_org_number ON service_orders (organization_id, os_number);
CREATE INDEX idx_service_orders_client_id ON service_orders (client_id);
CREATE INDEX idx_service_orders_vehicle_id ON service_orders (vehicle_id);
CREATE INDEX idx_service_orders_status_id ON service_orders (organization_id, status_id, entry_date DESC);
CREATE INDEX idx_service_orders_assigned_to ON service_orders (assigned_to);
CREATE INDEX idx_service_orders_quote_id ON service_orders (quote_id);

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

-- Fotos/anexos da OS: file_metadata (migration 0010), entity_type='service_order',
-- attachment_type IN ('photo_before','photo_after','document','other').


-- ---------------------------------------------------------------------------
-- fn_set_vehicle_journey_stage — sincroniza vehicle_shop_visits.current_stage_id
-- e vehicles.journey_stage_id/journey_stage_updated_at quando o estágio de
-- jornada do veículo muda (chamado por Server Action ao mover o card no
-- Kanban /patio, e por triggers de status de quotes/service_orders).
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


-- =============================================================================
-- FKs cruzadas adiadas (dependências cíclicas entre agenda/vistorias/
-- orçamentos/OS/pátio — colunas criadas em 0005/0006 sem constraint).
-- =============================================================================
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_inspection FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id),
  ADD CONSTRAINT fk_appointments_quote FOREIGN KEY (quote_id) REFERENCES quotes(id),
  ADD CONSTRAINT fk_appointments_service_order FOREIGN KEY (service_order_id) REFERENCES service_orders(id);

ALTER TABLE vehicle_inspections
  ADD CONSTRAINT fk_inspections_quote FOREIGN KEY (quote_id) REFERENCES quotes(id);

ALTER TABLE vehicle_shop_visits
  ADD CONSTRAINT fk_shop_visits_service_order FOREIGN KEY (service_order_id) REFERENCES service_orders(id);

ALTER TABLE quotes
  ADD CONSTRAINT fk_quotes_converted_so FOREIGN KEY (converted_to_service_order_id) REFERENCES service_orders(id);
