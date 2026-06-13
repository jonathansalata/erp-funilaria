"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { QuoteDetailClient } from "@/components/orcamentos/quote-detail-client";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

type OrcamentoDetailViewProps = {
  /** Código do orçamento na URL (ex: "orc-2026-000125"), ou `id` legado. */
  code: string;
};

export function OrcamentoDetailView({ code }: OrcamentoDetailViewProps) {
  const router = useRouter();
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const quotes = useErpDataStore((state) => state.quotes);

  const quote =
    quotes.find((item) => item.code.toLowerCase() === code.toLowerCase()) ??
    quotes.find((item) => item.id === code);

  const isLegacyIdMatch = Boolean(quote) && quote!.code.toLowerCase() !== code.toLowerCase();

  useEffect(() => {
    if (isLegacyIdMatch && quote) {
      router.replace(`/orcamentos/${quote.code.toLowerCase()}`);
    }
  }, [isLegacyIdMatch, quote, router]);

  if (!hasHydrated) {
    return null;
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Orçamento não encontrado</h1>
        <p className="text-muted-foreground text-sm">
          O orçamento solicitado não existe ou foi removido.
        </p>
        <Button render={<Link href="/orcamentos" />}>Voltar para orçamentos</Button>
      </div>
    );
  }

  return <QuoteDetailClient quote={quote} />;
}
