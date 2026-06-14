-- =============================================================================
-- Migration: 0001_init_extensions.sql
-- Descrição: Extensões do Postgres e funções genéricas usadas por todas as
--            migrations seguintes.
-- Referência: docs/FASE3_SCHEMA.sql (Seção 1), docs/ARCHITECTURE.md (seção 6)
-- =============================================================================

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
-- fn_financial_audit_trigger, fn_recalc_*, fn_set_vehicle_journey_stage etc.
-- são definidas nas migrations correspondentes (0002, 0003, 0006-0010), após
-- as tabelas que referenciam.
