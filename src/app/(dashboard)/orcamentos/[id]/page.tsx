import { notFound } from "next/navigation";

import { QuoteDetailClient } from "@/components/orcamentos/quote-detail-client";
import { getQuoteById } from "@/lib/mock-data/quotes-data";

export default async function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = getQuoteById(id);

  if (!quote) {
    notFound();
  }

  return <QuoteDetailClient quote={quote} />;
}
