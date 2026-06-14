import { useCallback } from "react";

import { useAuthContext } from "@/components/providers/auth-provider";
import type { PermissionAction } from "@/lib/mock-data/users";
import type { PermissionModule } from "@/lib/auth/types";

/** Permissões efetivas do usuário autenticado, via `fn_get_my_permissions` (Fase 3.3). */
export function usePermissions() {
  const { permissions, isLoading } = useAuthContext();

  const can = useCallback(
    (module: PermissionModule, action: PermissionAction) =>
      permissions.some(
        (entry) => entry.module === module && entry.action === action && entry.allowed,
      ),
    [permissions],
  );

  return { permissions, can, isLoading };
}
