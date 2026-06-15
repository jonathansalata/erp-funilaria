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

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
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
  const loadProfileAndPermissions = useCallback(
    async (currentUser: User | null, origin: string) => {
      console.log(
        `[PROFILE_DEBUG] loadProfileAndPermissions chamada (origem=${origin}) userId=${currentUser?.id ?? null}`,
      );

      if (!currentUser) {
        console.log(
          `[PROFILE_DEBUG] setProfile(null) — origem=${origin}, motivo=sem currentUser (logout/sem sessão)`,
        );
        setProfile(null);
        setRoleName(null);
        setPermissions([]);
        setProfileError(null);
        return;
      }

      try {
        const supabase = createClient();
        const [profileResult, roleNameResult, permissionsResult] = await withTimeout(
          Promise.all([
            supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
            supabase.rpc("fn_get_my_role_name"),
            supabase.rpc("fn_get_my_permissions"),
          ]),
          AUTH_TIMEOUT_MS,
          "Tempo esgotado ao carregar perfil e permissões.",
        );

        if (profileResult.error) {
          console.error("[auth-provider] falha ao carregar profile:", profileResult.error.message);
          console.log(
            `[PROFILE_DEBUG] profileResult.error — origem=${origin}, mensagem=${profileResult.error.message}, profile mantido (não sobrescreve com null)`,
          );
          setProfileError(profileResult.error.message);
        } else {
          console.log(
            `[PROFILE_DEBUG] setProfile(${profileResult.data ? "dados" : "null"}) — origem=${origin}, id=${profileResult.data?.id ?? null}, full_name=${profileResult.data?.full_name ?? null}`,
          );
          setProfile(profileResult.data ?? null);
          setProfileError(null);
        }

        if (roleNameResult.error) {
          console.error("[auth-provider] falha ao carregar role:", roleNameResult.error.message);
        } else {
          setRoleName(roleNameResult.data ?? null);
        }

        if (permissionsResult.error) {
          console.error(
            "[auth-provider] falha ao carregar permissions:",
            permissionsResult.error.message,
          );
        } else {
          setPermissions((permissionsResult.data ?? []) as PermissionEntry[]);
        }
      } catch (err) {
        console.error("[auth-provider] erro inesperado ao carregar profile/permissions:", err);
        console.log(
          `[PROFILE_DEBUG] catch em loadProfileAndPermissions — origem=${origin}, erro=${err instanceof Error ? err.message : String(err)}, profile mantido (não sobrescreve com null)`,
        );
        setProfileError(err instanceof Error ? err.message : "Erro inesperado ao carregar perfil.");
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    console.log("[PROFILE_DEBUG] useEffect montado — iniciando init() e onAuthStateChange");

    async function init() {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          "Tempo esgotado ao obter sessão (getSession).",
        );

        console.log(
          `[PROFILE_DEBUG] init: getSession() resolvido — userId=${session?.user?.id ?? null}, error=${error?.message ?? null}, active=${active}`,
        );

        if (error) {
          console.error("[auth-provider] getSession retornou erro:", error.message);
        }

        if (!active) {
          console.log(
            "[PROFILE_DEBUG] init: effect desmontado antes de getSession resolver — abortando (active=false)",
          );
          return;
        }
        setUser(session?.user ?? null);
        await loadProfileAndPermissions(session?.user ?? null, "init");
      } catch (err) {
        console.error("[auth-provider] erro inesperado ao inicializar sessão:", err);
        console.log(
          `[PROFILE_DEBUG] init: catch — erro=${err instanceof Error ? err.message : String(err)}, active=${active}`,
        );
        if (!active) return;
        console.log(
          "[PROFILE_DEBUG] setProfile(null) — origem=init.catch, motivo=getSession()/init lançou exceção",
        );
        setUser(null);
        setProfile(null);
        setRoleName(null);
        setPermissions([]);
        setProfileError(
          err instanceof Error ? err.message : "Erro inesperado ao inicializar sessão.",
        );
      } finally {
        if (active) {
          console.log("[PROFILE_DEBUG] init: finally — setIsLoading(false)");
          setIsLoading(false);
        } else {
          console.log(
            "[PROFILE_DEBUG] init: finally — active=false, NÃO chama setIsLoading(false)",
          );
        }
      }
    }

    void init();

    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = createClient();
      const { data: subscription } = supabase.auth.onAuthStateChange(
        async (event: string, session: Session | null) => {
          console.log(
            `[PROFILE_DEBUG] onAuthStateChange disparado — event=${event}, userId=${session?.user?.id ?? null}, active=${active}`,
          );
          if (!active) {
            console.log(
              `[PROFILE_DEBUG] onAuthStateChange: effect desmontado (active=false) — ignorando event=${event}`,
            );
            return;
          }
          setUser(session?.user ?? null);
          await loadProfileAndPermissions(session?.user ?? null, `onAuthStateChange:${event}`);
          console.log(`[PROFILE_DEBUG] onAuthStateChange (event=${event}): setIsLoading(false)`);
          setIsLoading(false);
        },
      );
      unsubscribe = () => subscription.subscription.unsubscribe();
    } catch (err) {
      console.error("[auth-provider] erro inesperado ao registrar onAuthStateChange:", err);
    }

    return () => {
      console.log(
        "[PROFILE_DEBUG] useEffect desmontado — active=false, unsubscribe onAuthStateChange",
      );
      active = false;
      unsubscribe?.();
    };
  }, [loadProfileAndPermissions]);

  const refreshProfile = useCallback(async () => {
    console.log(`[PROFILE_DEBUG] refreshProfile chamado — userId=${user?.id ?? null}`);
    await loadProfileAndPermissions(user, "refreshProfile");
  }, [loadProfileAndPermissions, user]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[auth-provider] erro ao encerrar sessão:", err);
    } finally {
      console.log("[PROFILE_DEBUG] setProfile(null) — origem=signOut, motivo=logout explícito");
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
      console.log(
        `[PROFILE_DEBUG] signOut automático — profile.status=${profile.status} (esperado: active)`,
      );
      void signOut();
    }
  }, [profile, signOut]);

  console.log(
    `[PROFILE_DEBUG] render — isLoading=${isLoading}, profile.id=${profile?.id ?? null}, profile.full_name=${profile?.full_name ?? null}, profileError=${profileError}`,
  );

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
