"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary global do App Router. Sem este arquivo, qualquer exceção não
 * tratada durante a renderização (ex.: acesso a propriedade `undefined`) zera
 * a tela inteira ("This page couldn't load"). Aqui exibimos uma tela de
 * recuperação com opção de tentar novamente.
 */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-xl font-semibold">Algo deu errado</h1>
        <p className="text-muted-foreground text-sm">
          Ocorreu um erro inesperado ao carregar esta página.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
