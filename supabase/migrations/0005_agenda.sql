-- =============================================================================
-- Migration: 0005_agenda.sql
-- Descrição: Agenda (appointments), vistorias (vehicle_inspections +
--            inspection_items) e jornada do veículo no pátio
--            (vehicle_shop_visits).
-- Referência: docs/FASE3_SCHEMA.sql (Seções 5-6), docs/ARCHITECTURE.md (seção 7)
--
-- NOTA — dependências cíclicas: appointments.inspection_id/quote_id/
-- service_order_id, vehicle_inspections.quote_id e
-- vehicle_shop_visits.service_order_id referenciam tabelas criadas na
-- migration 0006/0007. Essas colunas são criadas aqui SEM a constraint FK; as
-- constraints são adicionadas via ALTER TABLE no final da migration 0007,
-- quando todas as tabelas já existem.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
CREATE TABLE appointments (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         uuid NOT NULL REFERENCES organizations(id),
  code                    text NOT NULL,
  title                   text NOT NULL,
  appointment_type_id     uuid REFERENCES config_categories(id),
  client_id               uuid REFERENCES clients(id),
  vehicle_id              uuid REFERENCES vehicles(id),
  inspection_id           uuid,  -- FK -> vehicle_inspections(id), adicionada na migration 0007
  quote_id                uuid,  -- FK -> quotes(id), adicionada na migration 0007
  service_order_id        uuid,  -- FK -> service_orders(id), adicionada na migration 0007
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
  deleted_at              timestamptz,
  deleted_by              uuid REFERENCES profiles(id)
);

CREATE UNIQUE INDEX idx_appointments_org_code ON appointments (organization_id, code);
CREATE INDEX idx_appointments_starts_at ON appointments (organization_id, starts_at);
CREATE INDEX idx_appointments_assigned_to ON appointments (assigned_to);
CREATE INDEX idx_appointments_client_id ON appointments (client_id);
CREATE INDEX idx_appointments_vehicle_id ON appointments (vehicle_id);
CREATE INDEX idx_appointments_inspection_id ON appointments (inspection_id);
CREATE INDEX idx_appointments_quote_id ON appointments (quote_id);
CREATE INDEX idx_appointments_service_order_id ON appointments (service_order_id);

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


-- ---------------------------------------------------------------------------
-- vehicle_inspections
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
  quote_id        uuid,  -- FK -> quotes(id), adicionada na migration 0007
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
);

CREATE UNIQUE INDEX idx_vehicle_inspections_org_code ON vehicle_inspections (organization_id, code);
CREATE INDEX idx_vehicle_inspections_vehicle_id ON vehicle_inspections (vehicle_id);
CREATE INDEX idx_vehicle_inspections_status ON vehicle_inspections (organization_id, status);
CREATE INDEX idx_vehicle_inspections_quote_id ON vehicle_inspections (quote_id);

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
-- Validados na camada de aplicação (Server Action / Zod schema), não via CHECK.


-- ---------------------------------------------------------------------------
-- inspection_items (checklist da vistoria)
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

-- Fotos: file_metadata (migration 0010), entity_type='inspection'.
-- Conversão para Orçamento: ação "Gerar Orçamento a partir da Vistoria" cria um
-- `quotes` com vehicle_id/client_id pré-preenchidos e grava
-- `vehicle_inspections.quote_id`.


-- ---------------------------------------------------------------------------
-- vehicle_shop_visits
-- current_stage_id sincronizado a partir de `vehicles.journey_stage_id` via
-- fn_set_vehicle_journey_stage (migration 0007).
-- ---------------------------------------------------------------------------
CREATE TABLE vehicle_shop_visits (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  vehicle_id        uuid NOT NULL REFERENCES vehicles(id),
  client_id         uuid NOT NULL REFERENCES clients(id),
  service_order_id  uuid,  -- FK -> service_orders(id), adicionada na migration 0007
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
CREATE INDEX idx_vehicle_shop_visits_service_order_id ON vehicle_shop_visits (service_order_id);

CREATE TRIGGER trg_vehicle_shop_visits_updated_at
  BEFORE UPDATE ON vehicle_shop_visits
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
