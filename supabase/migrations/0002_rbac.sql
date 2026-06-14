-- =============================================================================
-- Migration: 0002_rbac.sql
-- Descrição: Multi-tenant (organizations), perfis (profiles), papéis (roles)
--            e permissões (RBAC: permissions / role_permissions /
--            user_permission_overrides) + fn_has_permission.
-- Referência: docs/FASE3_SCHEMA.sql (Seção 2), docs/ARCHITECTURE.md (seção 8)
--
-- Convenções (Fase 3.1, ajustes aprovados):
--   - organization_id NOT NULL em toda entidade de negócio
--   - soft delete: deleted_at + deleted_by nas entidades principais
-- =============================================================================

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
  deleted_at  timestamptz,
  deleted_by  uuid
);

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Organização seed (ambiente de desenvolvimento)
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
  deleted_at      timestamptz,
  deleted_by      uuid
);

CREATE UNIQUE INDEX idx_roles_org_name ON roles (organization_id, name)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 4 papéis-base do mock (Administrador/Gerente/Financeiro/Operacional).
-- "Personalizado" não tem seed fixo: criado ad-hoc por organização.
INSERT INTO roles (organization_id, name, description, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Administrador', 'Acesso total ao sistema', true),
  ('00000000-0000-0000-0000-000000000001', 'Gerente', 'Gestão operacional e comercial', false),
  ('00000000-0000-0000-0000-000000000001', 'Financeiro', 'Acesso ao módulo financeiro e leitura geral', false),
  ('00000000-0000-0000-0000-000000000001', 'Operacional', 'Atendimento, vistorias, orçamentos e OS', false);


-- ---------------------------------------------------------------------------
-- permissions
-- 12 módulos x ações relevantes (view/create/edit/delete/approve/cancel/financial)
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

-- Administrador: todas as permissions
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, true
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Administrador' AND r.organization_id = '00000000-0000-0000-0000-000000000001';

-- Gerente: replica ROLE_PERMISSION_PRESETS.gerente (src/lib/mock-data/users.ts)
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, true
FROM roles r
JOIN permissions p ON (p.module, p.action) IN (
  ('dashboard','view'),
  ('clientes','view'),('clientes','create'),('clientes','edit'),
  ('veiculos','view'),('veiculos','create'),('veiculos','edit'),
  ('vistorias','view'),('vistorias','create'),('vistorias','edit'),
  ('agenda','view'),('agenda','create'),('agenda','edit'),
  ('orcamentos','view'),('orcamentos','create'),('orcamentos','edit'),
    ('orcamentos','approve'),('orcamentos','cancel'),
  ('ordens_servico','view'),('ordens_servico','create'),('ordens_servico','edit'),
    ('ordens_servico','cancel'),
  ('financeiro','view'),('financeiro','create'),('financeiro','edit'),
    ('financeiro','delete'),('financeiro','financial'),
  ('auditoria','view'),
  ('configuracoes','view'),('configuracoes','edit')
)
WHERE r.name = 'Gerente' AND r.organization_id = '00000000-0000-0000-0000-000000000001';

-- Financeiro: replica ROLE_PERMISSION_PRESETS.financeiro
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, true
FROM roles r
JOIN permissions p ON (p.module, p.action) IN (
  ('dashboard','view'),
  ('clientes','view'),
  ('veiculos','view'),
  ('vistorias','view'),
  ('agenda','view'),
  ('orcamentos','view'),
  ('ordens_servico','view'),
  ('financeiro','view'),('financeiro','create'),('financeiro','edit'),
    ('financeiro','delete'),('financeiro','financial'),
  ('relatorios','view')
)
WHERE r.name = 'Financeiro' AND r.organization_id = '00000000-0000-0000-0000-000000000001';

-- Operacional: replica ROLE_PERMISSION_PRESETS.operacional
INSERT INTO role_permissions (role_id, permission_id, allowed)
SELECT r.id, p.id, true
FROM roles r
JOIN permissions p ON (p.module, p.action) IN (
  ('dashboard','view'),
  ('clientes','view'),('clientes','create'),('clientes','edit'),
  ('veiculos','view'),('veiculos','create'),('veiculos','edit'),
  ('vistorias','view'),('vistorias','create'),('vistorias','edit'),
  ('agenda','view'),('agenda','create'),('agenda','edit'),
  ('orcamentos','view'),('orcamentos','create'),('orcamentos','edit'),
  ('ordens_servico','view'),('ordens_servico','create'),('ordens_servico','edit')
)
WHERE r.name = 'Operacional' AND r.organization_id = '00000000-0000-0000-0000-000000000001';


-- ---------------------------------------------------------------------------
-- profiles  (1:1 com auth.users)
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
  deleted_at          timestamptz,
  deleted_by          uuid
);

CREATE INDEX idx_profiles_organization_id ON profiles (organization_id);
CREATE INDEX idx_profiles_role_id ON profiles (role_id);
CREATE INDEX idx_profiles_status ON profiles (status);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_deleted_by FOREIGN KEY (deleted_by) REFERENCES profiles(id);
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_deleted_by FOREIGN KEY (deleted_by) REFERENCES profiles(id);
ALTER TABLE roles ADD CONSTRAINT fk_roles_deleted_by FOREIGN KEY (deleted_by) REFERENCES profiles(id);


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
