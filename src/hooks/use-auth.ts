import { useAuthContext } from "@/components/providers/auth-provider";

/** Usuário autenticado (Supabase Auth) e respectivo `profiles` (Fase 3.3). */
export function useAuth() {
  const { user, profile, roleName, isLoading, signOut, refreshProfile } = useAuthContext();
  return { user, profile, roleName, isLoading, signOut, refreshProfile };
}
