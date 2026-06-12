"use client";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import {
  APPOINTMENT_STATUS_META,
  APPOINTMENT_TYPE_META,
  type Appointment,
} from "@/lib/mock-data/appointments";
import { getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatDate } from "@/lib/utils";

type AppointmentListProps = {
  appointments: Appointment[];
  onRowClick: (appointment: Appointment) => void;
};

const columns: DataTableColumn<Appointment>[] = [
  {
    id: "date",
    header: "Data",
    cell: (row) => `${formatDate(row.date)} · ${row.time}`,
    sortValue: (row) => `${row.date} ${row.time}`,
  },
  {
    id: "title",
    header: "Compromisso",
    cell: (row) => row.title,
    sortValue: (row) => row.title,
  },
  {
    id: "type",
    header: "Tipo",
    cell: (row) => (
      <StatusBadge variant={APPOINTMENT_TYPE_META[row.type].variant}>
        {APPOINTMENT_TYPE_META[row.type].label}
      </StatusBadge>
    ),
  },
  {
    id: "client",
    header: "Cliente",
    cell: (row) => (row.clientId ? (getClientById(row.clientId)?.name ?? "—") : "—"),
  },
  {
    id: "vehicle",
    header: "Veículo",
    cell: (row) => {
      if (!row.vehicleId) return "—";
      const vehicle = getVehicleById(row.vehicleId);
      return vehicle ? getVehicleLabel(vehicle) : "—";
    },
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <StatusBadge variant={APPOINTMENT_STATUS_META[row.status].variant}>
        {APPOINTMENT_STATUS_META[row.status].label}
      </StatusBadge>
    ),
  },
];

const filters: DataTableFilter<Appointment>[] = [
  {
    id: "type",
    label: "Tipo",
    options: Object.entries(APPOINTMENT_TYPE_META).map(([value, meta]) => ({
      label: meta.label,
      value,
    })),
    predicate: (row, value) => row.type === value,
  },
  {
    id: "status",
    label: "Status",
    options: Object.entries(APPOINTMENT_STATUS_META).map(([value, meta]) => ({
      label: meta.label,
      value,
    })),
    predicate: (row, value) => row.status === value,
  },
];

export function AppointmentList({ appointments, onRowClick }: AppointmentListProps) {
  return (
    <DataTable
      data={appointments}
      columns={columns}
      getRowId={(row) => row.id}
      searchPlaceholder="Buscar compromisso..."
      searchFn={(row, query) => row.title.toLowerCase().includes(query)}
      filters={filters}
      onRowClick={onRowClick}
      emptyMessage="Nenhum compromisso encontrado."
    />
  );
}
