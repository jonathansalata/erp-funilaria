"use client";

import Link from "next/link";

import { QuoteDetailClient } from "@/components/orcamentos/quote-detail-client";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

type OrcamentoDetailViewProps = {
  id: string;
};

export function OrcamentoDetailView({ id }: OrcamentoDetailViewProps) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const quote = useErpDataStore((state) => state.quotes.find((item) => item.id === id));

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
