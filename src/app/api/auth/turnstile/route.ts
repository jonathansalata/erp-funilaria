import { NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/security/turnstile";

/**
 * Bloco 47: verificação server-side do desafio Cloudflare Turnstile, chamada
 * pelo `login-form.tsx` antes de `signInWithPassword`. Ponto único para
 * evoluir com rate limiting/auditoria por IP no futuro.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = body?.token;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ success: false, error: "Token ausente." }, { status: 400 });
  }

  const remoteIp =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");

  const success = await verifyTurnstileToken(token, remoteIp);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Não foi possível confirmar que você é humano. Tente novamente." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
