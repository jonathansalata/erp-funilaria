"use client";

import { useEffect } from "react";

/**
 * Fallback para erros lançados no próprio `layout.tsx` raiz (onde `error.tsx`
 * não se aplica). Sem este arquivo, um erro aqui resulta em tela em branco
 * ("This page couldn't load") sem nenhuma forma de recuperação.
 */
export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold">Algo deu errado</h1>
            <p className="text-sm text-gray-500">
              Ocorreu um erro inesperado ao carregar a aplicação.
            </p>
          </div>
          <button onClick={reset} className="rounded-lg border px-4 py-2 text-sm font-medium">
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
