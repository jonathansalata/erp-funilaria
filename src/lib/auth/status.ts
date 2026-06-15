/** Status de `profiles.status` (Supabase Auth — Fase 3.3+, Bloco 39). */
export const PROFILE_STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

export const PROFILE_STATUS_VARIANTS: Record<string, "success" | "default" | "destructive"> = {
  active: "success",
  inactive: "default",
  blocked: "destructive",
};
