"use client";

import { useRouter } from "next/navigation";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import { INSPECTION_STATUS_META, type Inspection } from "@/lib/mock-data/inspections";
import { getVehicleLabelById } from "@/lib/mock-data/vehicles";
import { formatDateTime } from "@/lib/utils";

type InspectionsListTableProps = {
  inspections: Inspection[];
  initialStatus?: string;
};

export function InspectionsListTable({ inspections, initialStatus }: InspectionsListTableProps) {
  const router = useRouter();

  const columns: DataTableColumn<Inspection>[] = [
    {
      id: "code",
      header: "Código",
      cell: (inspection) => <span className="font-medium">{inspection.code}</span>,
      sortValue: (inspection) => inspection.code,
      className: "whitespace-nowrap",
    },
    {
      id: "client",
      header: "Cliente",
      cell: (inspection) => getClientById(inspection.clientId)?.name ?? "Cliente não encontrado",
      sortValue: (inspection) => getClientById(inspection.clientId)?.name ?? "",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (inspection) => (
        <span className="text-muted-foreground">{getVehicleLabelById(inspection.vehicleId)}</span>
      ),
      sortValue: (inspection) => getVehicleLabelById(inspection.vehicleId),
    },
    {
      id: "status",
      header: "Status",
      cell: (inspection) => (
        <StatusBadge variant={INSPECTION_STATUS_META[inspection.status].variant}>
          {INSPECTION_STATUS_META[inspection.status].title}
        </StatusBadge>
      ),
      sortValue: (inspection) => INSPECTION_STATUS_META[inspection.status].title,
    },
    {
      id: "mileage",
      header: "KM",
      cell: (inspection) => (
        <span className="text-muted-foreground">{inspection.mileage.toLocaleString("pt-BR")}</span>
      ),
      sortValue: (inspection) => inspection.mileage,
      className: "text-right",
    },
    {
      id: "updatedAt",
      header: "Atualizado",
      cell: (inspection) => (
        <span className="text-muted-foreground">{formatDateTime(inspection.updatedAt)}</span>
      ),
      sortValue: (inspection) => inspection.updatedAt,
    },
  ];

  const filters: DataTableFilter<Inspection>[] = [
    {
      id: "status",
      label: "Status",
      options: Object.entries(INSPECTION_STATUS_META).map(([value, meta]) => ({
        label: meta.title,
        value,
      })),
      predicate: (inspection, value) => inspection.status === value,
    },
  ];

  return (
    <DataTable
      data={inspections}
      columns={columns}
      getRowId={(inspection) => inspection.id}
      searchPlaceholder="Buscar por código, cliente ou veículo..."
      searchFn={(inspection, query) =>
        inspection.code.toLowerCase().includes(query) ||
        (getClientById(inspection.clientId)?.name.toLowerCase().includes(query) ?? false) ||
        getVehicleLabelById(inspection.vehicleId).toLowerCase().includes(query)
      }
      filters={filters}
      initialFilters={initialStatus ? { status: initialStatus } : undefined}
      onRowClick={(inspection) => router.push(`/vistorias/${inspection.id}`)}
      emptyMessage="Nenhuma vistoria encontrada."
    />
  );
}
