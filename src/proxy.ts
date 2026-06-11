import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // TODO (Fase 1): adicionar guarda de autenticação e de permissões (RBAC)
  // redirecionando usuários não autenticados para `/login` e usuários sem
  // permissão de `view` no módulo para a página de "Acesso negado".
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
