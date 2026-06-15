-- =============================================================================
-- Migration: 0013_users_management.sql
-- Descrição: Bloco 39 — Gestão de Usuários (finalização para produção).
--
-- - profiles.last_login_at: registrado no login (fn_touch_my_last_login),
--   exibido na listagem de usuários.
-- - fn_update_my_avatar(): atualiza o avatar do próprio usuário (mesmo padrão
--   SECURITY DEFINER de fn_update_my_profile, em função separada para não
--   alterar a assinatura existente).
-- - fn_list_roles(): lista os papéis (roles) da organização do usuário
--   autenticado, para popular o select "Perfil" no formulário de usuário —
--   "select_roles" (0002_rbac.sql) depende de fn_current_org_id() (NULL sem o
--   Custom Access Token Hook), por isso a leitura direta de `roles` falha via
--   RLS, mesmo para a própria organização.
-- - Bucket de Storage "avatars" (público) + policies de avatars/{user_id}.jpg.
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

CREATE OR REPLACE FUNCTION fn_touch_my_last_login()
RETURNS void AS $$
  UPDATE profiles SET last_login_at = now() WHERE id = auth.uid();
$$ LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION fn_update_my_avatar(p_avatar_url text)
RETURNS profiles AS $$
  UPDATE profiles
  SET avatar_url = p_avatar_url
  WHERE id = auth.uid()
  RETURNING *;
$$ LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION fn_list_roles()
RETURNS TABLE (id uuid, name text) AS $$
  SELECT r.id, r.name
  FROM roles r
  WHERE r.deleted_at IS NULL
    AND r.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  ORDER BY r.name;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- Storage: bucket "avatars" (público) + policies de avatars/{user_id}.jpg
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "select_avatars_public" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "insert_own_avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND split_part(name, '.', 1) = auth.uid()::text);

CREATE POLICY "update_own_avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND split_part(name, '.', 1) = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND split_part(name, '.', 1) = auth.uid()::text);

CREATE POLICY "delete_own_avatar" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND split_part(name, '.', 1) = auth.uid()::text);
