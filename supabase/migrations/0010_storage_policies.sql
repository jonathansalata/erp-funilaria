-- =============================================================================
-- Migration: 0010_storage_policies.sql
-- Descrição: file_metadata + buckets de Storage, RLS padrão consolidado para
--            todas as tabelas de negócio restantes, RLS de tabelas-filhas,
--            RLS de entity_events/audit_logs/financial_audit_logs/file_metadata
--            e fn_log_entity_event.
-- Referência: docs/FASE3_SCHEMA.sql (Seções 11-12), docs/ARCHITECTURE.md (seção 5.3, 7.9)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- file_metadata
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
  deleted_at      timestamptz,
  deleted_by      uuid REFERENCES profiles(id)
);

CREATE INDEX idx_file_metadata_entity
  ON file_metadata (organization_id, entity_type, entity_id);

-- Convenção de path: {bucket}/{organization_id}/{entity_type}/{entity_id}/{uuid}-{filename}

-- ---------------------------------------------------------------------------
-- organizations.settings (jsonb) — CompanyInfo / DocumentSettings
-- settings.company = {
--   legal_name, fantasy_name, document, phone, email, address, city, state,
--   zip_code,
--   logo_file_id, signature_file_id, stamp_file_id -> file_metadata.id
--   (entity_type='organization', bucket='company-assets')
-- }
-- settings.documents = {
--   quote_validity_days, default_warranty_period_days,
--   quote_terms_text, service_order_terms_text
-- }
-- Validados via Zod na camada de aplicação, não via CHECK no jsonb.
--
-- Buckets a criar via Supabase Storage: avatars, vehicle-photos,
-- vehicle-documents, service-order-attachments, quote-attachments,
-- generated-pdfs, company-assets.
--
-- Storage RLS policies (storage.objects) seguem o padrão:
--   path = {bucket}/{organization_id}/{entity_type}/{entity_id}/...
--   USING ( (storage.foldername(name))[1] = fn_current_org_id()::text
--           AND fn_has_permission('<modulo_correspondente>','view'|'create'|...) )
-- onde <modulo_correspondente> é: avatars->usuarios, vehicle-photos/
-- vehicle-documents->veiculos, service-order-attachments->ordens_servico,
-- quote-attachments->orcamentos, company-assets->configuracoes,
-- generated-pdfs->o módulo da entidade referenciada.


-- =============================================================================
-- RLS padrão consolidado
-- Template (ARCHITECTURE.md §7.9):
--   SELECT: deleted_at IS NULL AND organization_id = fn_current_org_id()
--           AND fn_has_permission(module,'view')
--   INSERT: organization_id = fn_current_org_id() AND fn_has_permission(module,'create')
--   UPDATE: fn_has_permission(module,'edit') OR fn_has_permission(module,'delete')
--           (soft delete = UPDATE deleted_at/deleted_by, autorizado por 'delete')
--   DELETE físico: bloqueado (USING false)
-- =============================================================================
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
      USING (organization_id = fn_current_org_id()
             AND (fn_has_permission('%2$s','edit') OR fn_has_permission('%2$s','delete')))
      WITH CHECK (organization_id = fn_current_org_id()
             AND (fn_has_permission('%2$s','edit') OR fn_has_permission('%2$s','delete')))
    $f$, t.table_name, t.module);

    EXECUTE format('CREATE POLICY "delete_%1$s" ON %1$I FOR DELETE USING (false)', t.table_name);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- RLS de vehicle_shop_visits (Fase 3.2)
-- Diferente das demais 15 tabelas do template padrão, vehicle_shop_visits não
-- possui deleted_at/deleted_by (não há soft delete para visitas no pátio —
-- ver docs/FASE3_SCHEMA.sql, Seção 6); por isso recebe policies dedicadas,
-- equivalentes ao template porém sem a condição `deleted_at IS NULL`.
-- ---------------------------------------------------------------------------
ALTER TABLE vehicle_shop_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_vehicle_shop_visits" ON vehicle_shop_visits FOR SELECT
  USING (organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','view'));

CREATE POLICY "insert_vehicle_shop_visits" ON vehicle_shop_visits FOR INSERT
  WITH CHECK (organization_id = fn_current_org_id() AND fn_has_permission('ordens_servico','create'));

CREATE POLICY "update_vehicle_shop_visits" ON vehicle_shop_visits FOR UPDATE
  USING (organization_id = fn_current_org_id()
         AND (fn_has_permission('ordens_servico','edit') OR fn_has_permission('ordens_servico','delete')))
  WITH CHECK (organization_id = fn_current_org_id()
         AND (fn_has_permission('ordens_servico','edit') OR fn_has_permission('ordens_servico','delete')));

CREATE POLICY "delete_vehicle_shop_visits" ON vehicle_shop_visits FOR DELETE USING (false);

-- ---------------------------------------------------------------------------
-- RLS de document_sequences (Fase 3.1.2, Bloco 34)
-- Leitura restrita ao tenant; sem policies de INSERT/UPDATE para
-- `authenticated` — a tabela só é escrita via fn_next_document_number
-- (SECURITY DEFINER), que ignora RLS.
-- ---------------------------------------------------------------------------
ALTER TABLE document_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_document_sequences" ON document_sequences FOR SELECT
  USING (organization_id = fn_current_org_id());


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
-- RLS de tabelas-filhas (herdam permissão do pai via EXISTS)
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
-- RLS de entity_events, audit_logs, financial_audit_logs, file_metadata
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
-- fn_log_entity_event — gatilho genérico de timeline, usado por Server
-- Actions ao registrar eventos em entity_events.
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
