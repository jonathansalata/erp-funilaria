import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

/**
 * Cliente administrativo (service_role).
 * Ignora RLS — usar apenas em código server-only (Server Actions / Route Handlers)
 * para operações privilegiadas (ex.: criação de usuários no Auth).
 * NUNCA importar este módulo em código que possa ser incluído no bundle do cliente.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
