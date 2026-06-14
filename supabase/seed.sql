-- =============================================================================
-- Seed de dados iniciais (ambiente local de desenvolvimento)
-- =============================================================================
--
-- Organização ('Oficina Demo'), papéis e permissões já são inseridos pelas
-- próprias migrations (0002_rbac.sql, 0003_taxonomias.sql). Este seed cria
-- apenas o usuário administrador de desenvolvimento, para permitir login
-- local imediatamente após `supabase db reset`.
--
-- Credenciais de dev: admin@oficinademo.com / admin123456
-- =============================================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@oficinademo.com',
  extensions.crypt('admin123456', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

INSERT INTO profiles (id, organization_id, full_name, email, role_id, status)
SELECT
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-000000000001',
  'Administrador Demo',
  'admin@oficinademo.com',
  r.id,
  'active'
FROM roles r
WHERE r.organization_id = '00000000-0000-0000-0000-000000000001' AND r.name = 'Administrador';
