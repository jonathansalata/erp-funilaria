import type { Client } from "@/lib/mock-data/clients";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import {
  calculateQuoteTotal,
  getQuoteItemCategoryLabel,
  type Quote,
  type QuoteItem,
} from "@/lib/mock-data/quotes-data";
import type { Vehicle } from "@/lib/mock-data/vehicles";
import { getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { addPdfKeyValueSection, addPdfTable, createPdfDocument } from "@/lib/pdf/pdf-utils";

const QUOTE_ITEM_COLUMNS = [
  { header: "Descrição", value: (row: QuoteItem) => row.description },
  { header: "Categoria", value: (row: QuoteItem) => getQuoteItemCategoryLabel(row.category) },
  { header: "Qtd.", value: (row: QuoteItem) => String(row.quantity), align: "right" as const },
  {
    header: "Valor unit.",
    value: (row: QuoteItem) => formatCurrency(row.unitPrice),
    align: "right" as const,
  },
  {
    header: "Desconto",
    value: (row: QuoteItem) => (row.discount ? `${row.discount}%` : "—"),
    align: "right" as const,
  },
  {
    header: "Subtotal",
    value: (row: QuoteItem) => {
      const lineSubtotal = row.quantity * row.unitPrice;
      const lineDiscount = row.discount ? (lineSubtotal * row.discount) / 100 : 0;
      return formatCurrency(lineSubtotal - lineDiscount);
    },
    align: "right" as const,
  },
];

/** Monta o documento PDF de um orçamento (Fase 2B.5 — Bloco 03). */
export function buildQuotePdf(quote: Quote, client?: Client, vehicle?: Vehicle) {
  const { doc, contentStartY } = createPdfDocument({
    title: "Orçamento",
    subtitle: quote.code,
  });

  const totals = calculateQuoteTotal(quote.items);

  let y = addPdfKeyValueSection(doc, contentStartY, "Dados do orçamento", [
    { label: "Código", value: quote.code },
    { label: "Status", value: QUOTE_STATUS_META[quote.status].title },
    { label: "Cliente", value: client?.name ?? "—" },
    { label: "Veículo", value: vehicle ? getVehicleLabel(vehicle) : "—" },
    { label: "Criado em", value: formatDateTime(quote.createdAt) },
    { label: "Válido até", value: quote.validUntil ? formatDate(quote.validUntil) : "—" },
  ]);

  y = addPdfTable(doc, y + 10, quote.items, QUOTE_ITEM_COLUMNS);

  y = addPdfKeyValueSection(doc, y + 20, "Totais", [
    { label: "Subtotal", value: formatCurrency(totals.subtotal) },
    { label: "Descontos", value: formatCurrency(totals.discountTotal) },
    { label: "Total", value: formatCurrency(totals.total) },
  ]);

  if (quote.notes) {
    addPdfKeyValueSection(doc, y + 20, "Observações", [{ label: "Notas", value: quote.notes }]);
  }

  return doc;
}
