"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { PermissionEntry, Profile } from "@/lib/auth/types";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  roleName: string | null;
  permissions: PermissionEntry[];
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO(BLOCO 41 - diagnóstico, remover): instância única do AuthProvider?
  // Loga mount/unmount para confirmar se o provider remonta ao navegar.
  useEffect(() => {
    console.log("[BLOCO41][auth-provider] MOUNT", { pathname });
    return () => {
      console.log("[BLOCO41][auth-provider] UNMOUNT", { pathname });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO(BLOCO 41 - diagnóstico, remover): estado atual em cada navegação/render.
  useEffect(() => {
    console.log("[BLOCO41][auth-provider] STATE", {
      pathname,
      "auth.user.id": user?.id ?? null,
      "profile.id": profile?.id ?? null,
      "profile.full_name": profile?.full_name ?? null,
      roleName,
      isLoading,
    });
  }, [pathname, user, profile, roleName, isLoading]);

  // Carrega `profiles` + RBAC (papel e permissões) do usuário autenticado. Qualquer falha aqui
  // (Supabase indisponível, env vars ausentes, erro de rede/RPC) é tratada como "sem perfil" em
  // vez de propagar — uma exceção não tratada neste provider derrubaria toda a árvore do
  // dashboard (AuthProvider envolve `(dashboard)/layout.tsx` por completo) e cairia no
  // error boundary mais próximo (ou em `global-error.tsx`, na ausência de um).
  const loadProfileAndPermissions = useCallback(
    async (currentUser: User | null, source: string) => {
      // TODO(BLOCO 41 - diagnóstico, remover)
      console.log("[BLOCO41][auth-provider] loadProfileAndPermissions:start", {
        source,
        "auth.user.id": currentUser?.id ?? null,
      });

      if (!currentUser) {
        setProfile(null);
        setRoleName(null);
        setPermissions([]);
        console.log("[BLOCO41][auth-provider] loadProfileAndPermissions:no-user", { source });
        return;
      }

      try {
        const supabase = createClient();
        const [profileResult, roleNameResult, permissionsResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
          supabase.rpc("fn_get_my_role_name"),
          supabase.rpc("fn_get_my_permissions"),
        ]);

        if (profileResult.error) {
          console.error("[auth-provider] falha ao carregar profile:", profileResult.error.message);
        }
        if (roleNameResult.error) {
          console.error("[auth-provider] falha ao carregar role:", roleNameResult.error.message);
        }
        if (permissionsResult.error) {
          console.error(
            "[auth-provider] falha ao carregar permissions:",
            permissionsResult.error.message,
          );
        }

        // TODO(BLOCO 41 - diagnóstico, remover)
        console.log("[BLOCO41][auth-provider] loadProfileAndPermissions:result", {
          source,
          "auth.user.id": currentUser.id,
          "profile.id": profileResult.data?.id ?? null,
          "profile.full_name": profileResult.data?.full_name ?? null,
          "profile.error": profileResult.error?.message ?? null,
          roleName: roleNameResult.data ?? null,
          "role.error": roleNameResult.error?.message ?? null,
        });

        setProfile(profileResult.data ?? null);
        setRoleName(roleNameResult.data ?? null);
        setPermissions((permissionsResult.data ?? []) as PermissionEntry[]);
      } catch (err) {
        console.error("[auth-provider] erro inesperado ao carregar profile/permissions:", err);
        setProfile(null);
        setRoleName(null);
        setPermissions([]);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[auth-provider] getSession retornou erro:", error.message);
        }

        if (!active) return;
        setUser(session?.user ?? null);
        await loadProfileAndPermissions(session?.user ?? null, "init:getSession");
      } catch (err) {
        console.error("[auth-provider] erro inesperado ao inicializar sessão:", err);
        if (!active) return;
        setUser(null);
        setProfile(null);
        setRoleName(null);
        setPermissions([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void init();

    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = createClient();
      const { data: subscription } = supabase.auth.onAuthStateChange(
        async (event: string, session: Session | null) => {
          if (!active) return;
          // TODO(BLOCO 41 - diagnóstico, remover)
          console.log("[BLOCO41][auth-provider] onAuthStateChange", {
            event,
            "session.user.id": session?.user?.id ?? null,
          });
          setUser(session?.user ?? null);
          await loadProfileAndPermissions(session?.user ?? null, `onAuthStateChange:${event}`);
          setIsLoading(false);
        },
      );
      unsubscribe = () => subscription.subscription.unsubscribe();
    } catch (err) {
      console.error("[auth-provider] erro inesperado ao registrar onAuthStateChange:", err);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [loadProfileAndPermissions]);

  const refreshProfile = useCallback(async () => {
    await loadProfileAndPermissions(user, "refreshProfile");
  }, [loadProfileAndPermissions, user]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[auth-provider] erro ao encerrar sessão:", err);
    } finally {
      setUser(null);
      setProfile(null);
      setRoleName(null);
      setPermissions([]);
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  // Bloco 39: usuários inativados/bloqueados pelo admin têm a sessão encerrada no próximo
  // carregamento de perfil (a revogação do Supabase Auth via `ban_duration` só impede novos
  // logins, não invalida sessões já abertas).
  useEffect(() => {
    if (profile && profile.status !== "active") {
      void signOut();
    }
  }, [profile, signOut]);

  return (
    <AuthContext.Provider
      value={{ user, profile, roleName, permissions, isLoading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de <AuthProvider>");
  }
  return context;
}
