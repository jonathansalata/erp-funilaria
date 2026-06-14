import type { ModuleKey, PermissionAction } from "@/lib/mock-data/users";
import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Módulo retornado por `fn_get_my_permissions`; inclui "usuarios" (RBAC), fora de `ModuleKey`. */
export type PermissionModule = ModuleKey | "usuarios";

export type PermissionEntry = {
  module: PermissionModule;
  action: PermissionAction;
  allowed: boolean;
};
