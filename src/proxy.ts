import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Fase 3.3: redireciona usuários não autenticados para `/login` (ver
  // updateSession). Guarda de permissões (RBAC) por módulo permanece para
  // uma fase futura.
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
