"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import type { Quote } from "@/lib/mock-data/quotes-data";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import type { ServiceOrder } from "@/lib/mock-data/service-orders-data";
import { getVehicleLabelById } from "@/lib/mock-data/vehicles";
import { formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type ServiceOrdersListTableProps = {
  orders: ServiceOrder[];
  quotes: Quote[];
  initialStatus?: string;
};

export function ServiceOrdersListTable({
  orders,
  quotes,
  initialStatus,
}: ServiceOrdersListTableProps) {
  const router = useRouter();
  const technicians = useErpDataStore((state) => state.technicians);
  const getTechnicianName = (technicianId: string) =>
    technicians.find((technician) => technician.id === technicianId)?.name;

  const columns: DataTableColumn<ServiceOrder>[] = [
    {
      id: "code",
      header: "Código",
      cell: (order) => <span className="font-medium">{order.code}</span>,
      sortValue: (order) => order.code,
      className: "whitespace-nowrap",
    },
    {
      id: "client",
      header: "Cliente",
      cell: (order) => getClientById(order.clientId)?.name ?? "Cliente não encontrado",
      sortValue: (order) => getClientById(order.clientId)?.name ?? "",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (order) => (
        <span className="text-muted-foreground">{getVehicleLabelById(order.vehicleId)}</span>
      ),
      sortValue: (order) => getVehicleLabelById(order.vehicleId),
    },
    {
      id: "technician",
      header: "Técnico",
      cell: (order) => (
        <span className="text-muted-foreground">
          {getTechnicianName(order.technicianId) ?? "Não atribuído"}
        </span>
      ),
      sortValue: (order) => getTechnicianName(order.technicianId) ?? "",
    },
    {
      id: "origin",
      header: "Origem",
      cell: (order) => {
        const quote = order.quoteId ? quotes.find((item) => item.id === order.quoteId) : undefined;
        if (!quote) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <Link
            href={`/orcamentos/${quote.id}`}
            className="text-primary hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {quote.code}
          </Link>
        );
      },
      sortValue: (order) => {
        const quote = order.quoteId ? quotes.find((item) => item.id === order.quoteId) : undefined;
        return quote?.code ?? "";
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (order) => (
        <StatusBadge variant={SERVICE_ORDER_STATUS_META[order.status].variant}>
          {SERVICE_ORDER_STATUS_META[order.status].title}
        </StatusBadge>
      ),
      sortValue: (order) => SERVICE_ORDER_STATUS_META[order.status].title,
    },
    {
      id: "dueDate",
      header: "Previsão",
      cell: (order) => <span className="text-muted-foreground">{formatDate(order.dueDate)}</span>,
      sortValue: (order) => order.dueDate,
    },
  ];

  const filters: DataTableFilter<ServiceOrder>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        ...Object.entries(SERVICE_ORDER_STATUS_META).map(([value, meta]) => ({
          label: meta.title,
          value,
        })),
        { label: "Entregas previstas hoje", value: "entregas_hoje" },
      ],
      predicate: (order, value) =>
        value === "entregas_hoje"
          ? order.dueDate.startsWith(REFERENCE_DATE) && order.status !== "entregue"
          : order.status === value,
    },
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      getRowId={(order) => order.id}
      searchPlaceholder="Buscar por código, cliente ou veículo..."
      searchFn={(order, query) =>
        order.code.toLowerCase().includes(query) ||
        (getClientById(order.clientId)?.name.toLowerCase().includes(query) ?? false) ||
        getVehicleLabelById(order.vehicleId).toLowerCase().includes(query)
      }
      filters={filters}
      initialFilters={initialStatus ? { status: initialStatus } : undefined}
      onRowClick={(order) => router.push(`/ordens-servico/${order.id}`)}
      emptyMessage="Nenhuma ordem de serviço encontrada."
    />
  );
}
