"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { PermissionEntry, Profile } from "@/lib/auth/types";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  roleName: string | null;
  permissions: PermissionEntry[];
  isLoading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Bloco 44: o GoTrueClient (@supabase/auth-js) usa `navigator.locks` para coordenar
// `getSession()`/refresh entre abas. Se uma aba travar com o lock preso (ex.: crash em
// `error.tsx` no meio de uma chamada), novas chamadas a `getSession()`/`.from()`/`.rpc()`
// (que dependem do token retornado por `getSession()`) ficam pendentes para sempre — sem
// erro e sem rejeição. Sem um timeout, `isLoading` nunca vira `false` e `profile` nunca
// é definido, mesmo com o `profile` já tendo sido carregado com sucesso anteriormente.
const AUTH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Carrega `profiles` + RBAC (papel e permissões) do usuário autenticado. Qualquer falha aqui
  // (Supabase indisponível, env vars ausentes, erro de rede/RPC) é tratada como "sem perfil" em
  // vez de propagar — uma exceção não tratada neste provider derrubaria toda a árvore do
  // dashboard (AuthProvider envolve `(dashboard)/layout.tsx` por completo) e cairia no
  // error boundary mais próximo (ou em `global-error.tsx`, na ausência de um).
  //
  // Bloco 42: falhas pontuais (erro de rede/RPC após o login inicial) NÃO sobrescrevem um
  // `profile` já carregado com `null` — preserva-se o último perfil válido e expõe-se
  // `profileError` para o Header diferenciar "carregando" / "erro" / "sem perfil".
  const loadProfileAndPermissions = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setRoleName(null);
      setPermissions([]);
      setProfileError(null);
      return;
    }

    const supabase = createClient();

    // Bloco 48D: as 3 chamadas eram combinadas num único `Promise.all` + `withTimeout`.
    // Se QUALQUER UMA das 3 (inclusive as RPCs de role/permissions) der timeout/erro,
    // o `Promise.all` rejeita inteiro e o `catch` definia apenas `profileError`, SEM
    // nunca inspecionar o resultado da query de `profiles` — mesmo que ela tivesse
    // retornado com sucesso. Isso fazia `profile` permanecer `null` mesmo com
    // `auth.user` presente e a linha existindo em `profiles`. Agora cada chamada é
    // independente (`Promise.allSettled`): uma falha/timeout no role ou nas
    // permissions não impede mais `profile` de ser definido.
    const [profileSettled, roleNameSettled, permissionsSettled] = await Promise.allSettled([
      withTimeout(
        supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
        AUTH_TIMEOUT_MS,
        "Tempo esgotado ao carregar profile.",
      ),
      withTimeout(
        supabase.rpc("fn_get_my_role_name"),
        AUTH_TIMEOUT_MS,
        "Tempo esgotado ao carregar role.",
      ),
      withTimeout(
        supabase.rpc("fn_get_my_permissions"),
        AUTH_TIMEOUT_MS,
        "Tempo esgotado ao carregar permissions.",
      ),
    ]);

    if (profileSettled.status === "fulfilled") {
      const profileResult = profileSettled.value;
      if (profileResult.error) {
        console.error("[auth-provider] falha ao carregar profile:", profileResult.error.message);
        setProfileError(profileResult.error.message);
      } else {
        setProfile(profileResult.data ?? null);
        setProfileError(null);
      }
    } else {
      console.error("[auth-provider] erro/timeout ao carregar profile:", profileSettled.reason);
      setProfileError(
        profileSettled.reason instanceof Error
          ? profileSettled.reason.message
          : "Erro inesperado ao carregar perfil.",
      );
    }

    if (roleNameSettled.status === "fulfilled") {
      const roleNameResult = roleNameSettled.value;
      if (roleNameResult.error) {
        console.error("[auth-provider] falha ao carregar role:", roleNameResult.error.message);
      } else {
        setRoleName(roleNameResult.data ?? null);
      }
    } else {
      console.error("[auth-provider] erro/timeout ao carregar role:", roleNameSettled.reason);
    }

    if (permissionsSettled.status === "fulfilled") {
      const permissionsResult = permissionsSettled.value;
      if (permissionsResult.error) {
        console.error(
          "[auth-provider] falha ao carregar permissions:",
          permissionsResult.error.message,
        );
      } else {
        setPermissions((permissionsResult.data ?? []) as PermissionEntry[]);
      }
    } else {
      console.error(
        "[auth-provider] erro/timeout ao carregar permissions:",
        permissionsSettled.reason,
      );
    }
  }, []);

  // Bloco 46: atualiza `profiles.last_login_at` no banco (via RPC SECURITY DEFINER) e reflete
  // o novo valor no `profile` em memória imediatamente, sem exigir um segundo carregamento.
  // Chamada apenas no evento `SIGNED_IN` (login real), nunca em `INITIAL_SESSION`/
  // `TOKEN_REFRESHED`, e sempre aguardada (sem fire-and-forget) com erro tratado/logado.
  const touchLastLogin = useCallback(async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("fn_touch_my_last_login");

      if (error) {
        console.error("[auth-provider] falha ao atualizar last_login_at:", error.message);
        return;
      }

      const now = new Date().toISOString();
      setProfile((prev) => (prev ? { ...prev, last_login_at: now } : prev));
    } catch (err) {
      console.error("[auth-provider] erro inesperado ao atualizar last_login_at:", err);
    }
  }, []);

  // Bloco 49C: `init()`/`getSession()` foi removido. `onAuthStateChange` é a ÚNICA fonte de
  // sessão — seu primeiro evento (`INITIAL_SESSION`) já entrega a sessão recuperada (ou
  // `null`, se não houver). Um timer de fallback apenas encerra `isLoading` se nenhum evento
  // chegar dentro de `AUTH_TIMEOUT_MS`, SEM jamais zerar `user`/`profile`/`roleName`/
  // `permissions` — nenhum timeout pode mais destruir um estado já carregado.
  useEffect(() => {
    let active = true;
    let initialEventHandled = false;

    const fallbackTimer = setTimeout(() => {
      if (!active || initialEventHandled) return;
      setIsLoading(false);
    }, AUTH_TIMEOUT_MS);

    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = createClient();
      const { data: subscription } = supabase.auth.onAuthStateChange(
        async (event: string, session: Session | null) => {
          if (!active) return;

          if (!initialEventHandled) {
            initialEventHandled = true;
            clearTimeout(fallbackTimer);
          }

          setUser(session?.user ?? null);
          await loadProfileAndPermissions(session?.user ?? null);

          // Bloco 46: somente em SIGNED_IN (login real) — não em INITIAL_SESSION/TOKEN_REFRESHED —
          // e somente após a sessão estar totalmente estabelecida (profile já carregado acima).
          if (event === "SIGNED_IN") {
            await touchLastLogin();
          }

          setIsLoading(false);
        },
      );
      unsubscribe = () => subscription.subscription.unsubscribe();
    } catch (err) {
      console.error("[auth-provider] erro inesperado ao registrar onAuthStateChange:", err);
    }

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
      unsubscribe?.();
    };
  }, [loadProfileAndPermissions, touchLastLogin]);

  const refreshProfile = useCallback(async () => {
    await loadProfileAndPermissions(user);
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
      value={{
        user,
        profile,
        roleName,
        permissions,
        isLoading,
        profileError,
        signOut,
        refreshProfile,
      }}
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
