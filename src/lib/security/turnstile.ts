import "server-only";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/**
 * Valida um token do Cloudflare Turnstile junto à API `siteverify`, usando
 * `TURNSTILE_SECRET_KEY`. Nunca confiar apenas na validação do frontend
 * (widget) — esta função é a verificação autoritativa server-side (Bloco 47).
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY ausente — verificação desativada");
    return false;
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as SiteverifyResponse;

    if (!data.success) {
      console.error("[turnstile] siteverify retornou falha:", data["error-codes"]);
    }

    return data.success === true;
  } catch (err) {
    console.error("[turnstile] erro inesperado ao chamar siteverify:", err);
    return false;
  }
}
