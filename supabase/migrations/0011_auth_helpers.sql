-- =============================================================================
-- Migration: 0011_auth_helpers.sql
-- Descrição: RPC auxiliar de autenticação (Fase 3.3).
--
-- fn_current_org_id()/fn_current_role_id() dependem de claims
-- (app_metadata.organization_id / role_id) injetadas via Custom Access Token
-- Hook, ainda não configurado neste projeto. Sem essas claims,
-- "select_role_permissions" (0002_rbac.sql) nunca retorna linhas, pois exige
-- roles.organization_id = fn_current_org_id().
--
-- fn_get_my_permissions() resolve o módulo/ação/allowed do papel do usuário
-- autenticado a partir de auth.uid() -> profiles.role_id, sem depender de
-- claims do JWT. Usada por usePermissions() no client (Fase 3.3).
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_get_my_permissions()
RETURNS TABLE (module text, action text, allowed boolean) AS $$
  SELECT p.module, p.action, rp.allowed
  FROM profiles pr
  JOIN role_permissions rp ON rp.role_id = pr.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE pr.id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
