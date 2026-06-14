"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RecoverPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setIsSubmitting(false);

    if (error) {
      toast.error("Não foi possível enviar o e-mail de recuperação.");
      return;
    }

    setIsSent(true);
  }

  if (isSent) {
    return (
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Se houver uma conta associada a <strong>{email}</strong>, enviamos um link para
            redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/login" />} className="h-12 w-full text-base">
            Voltar para o login
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
        <CardTitle className="text-2xl">Recuperar senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </CardDescription>
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

          <Button type="submit" className="h-12 w-full text-base" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
          </Button>

          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline"
          >
            Voltar para o login
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
