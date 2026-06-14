"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

type SessionState = "checking" | "valid" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionState, setSessionState] = useState<SessionState>("checking");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");

    async function checkSession() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setSessionState(error ? "invalid" : "valid");
        return;
      }

      const { data } = await supabase.auth.getSession();
      setSessionState(data.session ? "valid" : "invalid");
    }

    void checkSession();
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast.error("Não foi possível redefinir a senha.");
      return;
    }

    toast.success("Senha redefinida com sucesso.");
    router.push("/");
    router.refresh();
  }

  if (sessionState === "checking") {
    return null;
  }

  if (sessionState === "invalid") {
    return (
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl">Link inválido ou expirado</CardTitle>
          <CardDescription>
            Solicite um novo link de recuperação de senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/recuperar-senha" />} className="h-12 w-full text-base">
            Solicitar novo link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="items-center text-center">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground font-heading mb-2 flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
          EF
        </div>
        <CardTitle className="text-2xl">Definir nova senha</CardTitle>
        <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Nova senha</Label>
            <InputGroup className="h-12">
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
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

          <Button type="submit" className="h-12 w-full text-base" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
