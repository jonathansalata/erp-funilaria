-- =============================================================================
-- Migration: 0012_auth_profile_helpers.sql
-- Descrição: RPCs auxiliares de perfil (Fase 3.3).
--
-- fn_get_my_role_name(): nome do papel do usuário autenticado. "select_roles"
-- (0002_rbac.sql) exige organization_id = fn_current_org_id(), que retorna
-- NULL sem o Custom Access Token Hook — por isso a leitura direta da tabela
-- `roles` falha via RLS. Esta função resolve via auth.uid() -> profiles.role_id.
--
-- fn_update_my_profile(): "update_own_profile" (0002_rbac.sql) tem
-- WITH CHECK organization_id = fn_current_org_id(), também NULL sem o hook —
-- qualquer UPDATE em profiles falharia por RLS, mesmo no próprio registro
-- (USING id = auth.uid() passa, mas WITH CHECK nunca). Esta função permite
-- que o usuário atualize telefone/cargo do próprio perfil (tela "Meu perfil").
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_get_my_role_name()
RETURNS text AS $$
  SELECT r.name
  FROM profiles pr
  JOIN roles r ON r.id = pr.role_id
  WHERE pr.id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION fn_update_my_profile(p_phone text, p_job_title text)
RETURNS profiles AS $$
  UPDATE profiles
  SET phone = p_phone, job_title = p_job_title
  WHERE id = auth.uid()
  RETURNING *;
$$ LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public;
