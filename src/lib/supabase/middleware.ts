import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fase 2B.5: Supabase/Auth ainda não foram iniciados nesta fase. Sem essas
  // variáveis configuradas (ex.: ambiente Vercel sem Supabase), o proxy não
  // deve quebrar a aplicação — apenas segue sem renovar sessão.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes — auth desativada");
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANTE: não remova o supabase.auth.getUser().
  // Ele renova o token de sessão, mantendo o usuário autenticado.
  //
  // `getUser()` pode lançar (em vez de retornar `error`) quando o cookie de
  // sessão está corrompido/expirado ou a API do Supabase está inacessível.
  // Sem este try/catch, a exceção derruba o proxy inteiro e o Next/Vercel
  // exibe "This page couldn't load" em vez de redirecionar para `/login`.
  let user = null;
  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser;
  } catch (err) {
    console.error("[middleware] getUser() lançou — tratando como não autenticado:", err);
    user = null;
  }

  const { pathname, search } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/recuperar-senha") ||
    pathname.startsWith("/redefinir-senha") ||
    pathname.startsWith("/api/auth/");

  if (!user && !isAuthRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}
