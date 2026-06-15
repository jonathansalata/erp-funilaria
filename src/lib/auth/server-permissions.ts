import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PermissionAction } from "@/lib/mock-data/users";

type UsuariosPermissions = {
  userId: string;
  organizationId: string;
  can: (action: PermissionAction) => boolean;
};

/**
 * Resolve o usuário autenticado (via cookies da requisição), sua
 * `organization_id` e suas permissões efetivas no módulo `usuarios`, usando
 * `fn_get_my_permissions()` (SECURITY DEFINER, não depende de claims do JWT —
 * ver 0011_auth_helpers.sql). Usado pelas rotas administrativas em
 * `src/app/api/usuarios/**` para autorizar operações privilegiadas antes de
 * usar o client Service Role.
 *
 * Retorna `null` se não houver usuário autenticado ou perfil associado.
 */
export async function getUsuariosPermissions(): Promise<UsuariosPermissions | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileResult, permissionsResult] = await Promise.all([
    supabase.from("profiles").select("organization_id").eq("id", user.id).single(),
    supabase.rpc("fn_get_my_permissions"),
  ]);

  if (profileResult.error || !profileResult.data) return null;

  const permissions = permissionsResult.data ?? [];

  return {
    userId: user.id,
    organizationId: profileResult.data.organization_id,
    can: (action) =>
      permissions.some(
        (entry) => entry.module === "usuarios" && entry.action === action && entry.allowed,
      ),
  };
}
