import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

// Bloco 48A: o GoTrueClient (@supabase/auth-js) faz fetch() para o endpoint de
// refresh token (`/auth/v1/token?grant_type=refresh_token`) sem nenhum timeout
// próprio. Se essa requisição travar (nunca resolver nem rejeitar) — ex.: rede do
// navegador para o domínio do Supabase —, a `initializePromise` interna do
// GoTrueClient (singleton, cacheado por `createBrowserClient`) nunca resolve.
// Como `getSession()` e todas as chamadas `.from()`/`.rpc()` aguardam essa mesma
// promise para obter o access token, TODAS ficam pendentes para sempre — em toda
// página, pelo resto da vida da aba — mesmo com o `withTimeout` do AuthProvider,
// que apenas abandona a promise externa sem destravar a interna. Um `fetch` com
// timeout próprio (abaixo do `AUTH_TIMEOUT_MS` do AuthProvider) garante que o
// GoTrueClient sempre receba um erro/rejeição e consiga concluir `_initialize()`.
const SUPABASE_FETCH_TIMEOUT_MS = 6000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);

  const signal = init?.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;

  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeout));
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
    },
  );
}
