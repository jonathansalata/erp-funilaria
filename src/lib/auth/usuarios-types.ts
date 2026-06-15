/** Tipos compartilhados do módulo Usuários (Bloco 39 — `/api/usuarios/*`). */
export type ApiUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  avatar_url: string | null;
  role_id: string | null;
  role: { id: string; name: string } | null;
  status: string;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
};

export type RoleOption = {
  id: string;
  name: string;
};
