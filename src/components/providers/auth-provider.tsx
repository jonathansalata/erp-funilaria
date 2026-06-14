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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfileAndPermissions = useCallback(async (currentUser: User | null) => {
    const supabase = createClient();

    if (!currentUser) {
      setProfile(null);
      setRoleName(null);
      setPermissions([]);
      return;
    }

    const [{ data: profileData }, { data: roleNameData }, { data: permissionsData }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
        supabase.rpc("fn_get_my_role_name"),
        supabase.rpc("fn_get_my_permissions"),
      ]);

    setProfile(profileData ?? null);
    setRoleName(roleNameData ?? null);
    setPermissions((permissionsData ?? []) as PermissionEntry[]);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      await loadProfileAndPermissions(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        await loadProfileAndPermissions(session?.user ?? null);
        setIsLoading(false);
      },
    );

    return () => subscription.subscription.unsubscribe();
  }, [loadProfileAndPermissions]);

  const refreshProfile = useCallback(async () => {
    await loadProfileAndPermissions(user);
  }, [loadProfileAndPermissions, user]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

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
