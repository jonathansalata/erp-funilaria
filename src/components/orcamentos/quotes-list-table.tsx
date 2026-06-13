"use client";

import { useRouter } from "next/navigation";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal, type Quote } from "@/lib/mock-data/quotes-data";
import { getVehicleLabelById } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type QuotesListTableProps = {
  quotes: Quote[];
  initialStatus?: string;
};

export function QuotesListTable({ quotes, initialStatus }: QuotesListTableProps) {
  const router = useRouter();

  const columns: DataTableColumn<Quote>[] = [
    {
      id: "code",
      header: "Código",
      cell: (quote) => <span className="font-medium">{quote.code}</span>,
      sortValue: (quote) => quote.code,
      className: "whitespace-nowrap",
    },
    {
      id: "client",
      header: "Cliente",
      cell: (quote) => getClientById(quote.clientId)?.name ?? "Cliente não encontrado",
      sortValue: (quote) => getClientById(quote.clientId)?.name ?? "",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (quote) => (
        <span className="text-muted-foreground">{getVehicleLabelById(quote.vehicleId)}</span>
      ),
      sortValue: (quote) => getVehicleLabelById(quote.vehicleId),
    },
    {
      id: "value",
      header: "Valor",
      cell: (quote) => formatCurrency(calculateQuoteTotal(quote.items).total),
      sortValue: (quote) => calculateQuoteTotal(quote.items).total,
    },
    {
      id: "status",
      header: "Status",
      cell: (quote) => (
        <StatusBadge variant={QUOTE_STATUS_META[quote.status].variant}>
          {QUOTE_STATUS_META[quote.status].title}
        </StatusBadge>
      ),
      sortValue: (quote) => QUOTE_STATUS_META[quote.status].title,
    },
    {
      id: "updatedAt",
      header: "Atualizado",
      cell: (quote) => (
        <span className="text-muted-foreground">{formatDateTime(quote.updatedAt)}</span>
      ),
      sortValue: (quote) => quote.updatedAt,
    },
  ];

  const filters: DataTableFilter<Quote>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        ...Object.entries(QUOTE_STATUS_META).map(([value, meta]) => ({
          label: meta.title,
          value,
        })),
        { label: "Aguardando aprovação", value: "aguardando_aprovacao" },
      ],
      predicate: (quote, value) =>
        value === "aguardando_aprovacao"
          ? quote.status === "enviado" || quote.status === "em_negociacao"
          : quote.status === value,
    },
  ];

  return (
    <DataTable
      data={quotes}
      columns={columns}
      getRowId={(quote) => quote.id}
      searchPlaceholder="Buscar por código, cliente ou veículo..."
      searchFn={(quote, query) =>
        quote.code.toLowerCase().includes(query) ||
        (getClientById(quote.clientId)?.name.toLowerCase().includes(query) ?? false) ||
        getVehicleLabelById(quote.vehicleId).toLowerCase().includes(query)
      }
      filters={filters}
      initialFilters={initialStatus ? { status: initialStatus } : undefined}
      onRowClick={(quote) => router.push(`/orcamentos/${quote.code.toLowerCase()}`)}
      emptyMessage="Nenhum orçamento encontrado."
    />
  );
}
