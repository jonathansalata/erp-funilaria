-- =============================================================================
-- Migration: 0004_clients_vehicles.sql
-- Descrição: Clientes e veículos.
-- Referência: docs/FASE3_SCHEMA.sql (Seção 4), docs/ARCHITECTURE.md (seção 7)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- clients
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
  deleted_at          timestamptz,
  deleted_by          uuid REFERENCES profiles(id)
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
-- journey_stage_id/journey_stage_updated_at: estado atual da jornada do
-- veículo (Kanban /patio, 8 estágios — config_categories.type=
-- 'vehicle_journey_stage'), sincronizado com vehicle_shop_visits.current_stage_id
-- via fn_set_vehicle_journey_stage (migration 0007).
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
  deleted_at               timestamptz,
  deleted_by               uuid REFERENCES profiles(id)
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

-- Fotos/documentos do veículo: file_metadata (migration 0010), entity_type='vehicle'.
