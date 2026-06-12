import type { KanbanColumnData } from "@/components/shared/kanban-board";
import type { StatusVariant } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import { calculateQuoteTotal, type Quote, type QuoteStatus } from "@/lib/mock-data/quotes-data";
import { getVehicleLabelById } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDateTime } from "@/lib/utils";

/**
 * Pipeline de Orçamentos derivada de `quotes-data.ts` + `clients.ts` + `vehicles.ts`.
 * Mantém o shape `KanbanColumnData<QuoteCard>[]` consumido pelas telas de Orçamentos.
 */
export type QuoteCard = {
  id: string;
  code: string;
  client: string;
  vehicle: string;
  value: string;
  updatedAt: string;
};

export const QUOTE_STATUS_META: Record<QuoteStatus, { title: string; variant: StatusVariant }> = {
  rascunho: { title: "Rascunho", variant: "default" },
  enviado: { title: "Enviado", variant: "info" },
  em_negociacao: { title: "Em negociação", variant: "warning" },
  aprovado: { title: "Aprovado", variant: "success" },
  recusado: { title: "Recusado", variant: "destructive" },
  cancelado: { title: "Cancelado", variant: "default" },
};

const QUOTE_STATUS_ORDER: QuoteStatus[] = [
  "rascunho",
  "enviado",
  "em_negociacao",
  "aprovado",
  "recusado",
  "cancelado",
];

/** Monta as colunas da Pipeline de Orçamentos a partir de uma lista de orçamentos. */
export function buildQuotePipelineColumns(quotes: Quote[]): KanbanColumnData<QuoteCard>[] {
  return QUOTE_STATUS_ORDER.map((status) => {
    const meta = QUOTE_STATUS_META[status];
    const items = quotes
      .filter((quote) => quote.status === status)
      .map((quote) => ({
        id: quote.id,
        code: quote.code,
        client: getClientById(quote.clientId)?.name ?? "Cliente não encontrado",
        vehicle: getVehicleLabelById(quote.vehicleId),
        value: formatCurrency(calculateQuoteTotal(quote.items).total),
        updatedAt: formatDateTime(quote.updatedAt),
      }));

    return {
      id: status,
      title: meta.title,
      variant: meta.variant,
      items,
    };
  });
}
