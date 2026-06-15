"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bloco 47: token do desafio Cloudflare Turnstile (modo Managed). Mantido apenas em memória —
  // nunca persistido — e descartado após cada tentativa de login (sucesso ou falha).
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const renderTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !window.turnstile || !turnstileContainerRef.current) return;
    if (turnstileWidgetIdRef.current) return;

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": () => setTurnstileToken(null),
    });
  }, []);

  // Cobre o caso de navegação client-side de volta para `/login`, onde o script do Turnstile
  // já está carregado (`window.turnstile` existe) e o `onLoad` do <Script> não dispara de novo.
  useEffect(() => {
    renderTurnstile();
    return () => {
      if (window.turnstile && turnstileWidgetIdRef.current) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [renderTurnstile]);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    if (window.turnstile && turnstileWidgetIdRef.current) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!turnstileToken) {
      toast.error("Conclua a verificação de segurança para continuar.");
      return;
    }

    setIsSubmitting(true);

    // `createClient()`/`signInWithPassword()` podem lançar (ex.: configuração do Supabase
    // ausente/inválida). Sem este try/catch, a exceção dentro desta função `async` se torna
    // uma promise rejeitada não tratada: o botão fica preso em "Entrando..." (nunca chega ao
    // `setIsSubmitting(false)`) e o erro não tratado pode escalar até `global-error.tsx`.
    try {
      // Bloco 47: o token do Turnstile é validado no backend (`/api/auth/turnstile`, usando
      // TURNSTILE_SECRET_KEY) ANTES de qualquer tentativa de autenticação — nunca confiar
      // apenas na validação do widget no frontend.
      const verifyRes = await fetch("/api/auth/turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = (await verifyRes.json().catch(() => null)) as { success?: boolean } | null;

      if (!verifyRes.ok || !verifyData?.success) {
        toast.error("Não foi possível confirmar que você é humano. Tente novamente.");
        resetTurnstile();
        setIsSubmitting(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      resetTurnstile();

      if (error) {
        toast.error("Não foi possível entrar. Verifique e-mail e senha.");
        setIsSubmitting(false);
        return;
      }

      const redirectTo = searchParams.get("redirectTo") ?? "/";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("[login-form] erro inesperado ao autenticar:", err);
      toast.error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
      resetTurnstile();
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="items-center text-center">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground font-heading mb-2 flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
          EF
        </div>
        <CardTitle className="text-2xl">ERP Funilaria</CardTitle>
        <CardDescription>Entre com seu e-mail e senha para acessar o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              className="h-12 px-3.5 text-base"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/recuperar-senha"
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <InputGroup className="h-12">
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="px-3.5 text-base"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
            />
            <Label htmlFor="keep-signed-in" className="text-muted-foreground font-normal">
              Manter conectado
            </Label>
          </div>

          <div ref={turnstileContainerRef} className="flex justify-center" />

          <Button
            type="submit"
            className="mt-1 h-12 w-full text-base"
            disabled={isSubmitting || !turnstileToken}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <Script src={TURNSTILE_SCRIPT_SRC} strategy="afterInteractive" onLoad={renderTurnstile} />
    </Card>
  );
}
