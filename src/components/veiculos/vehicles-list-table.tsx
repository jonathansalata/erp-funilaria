"use client";

import { useRouter } from "next/navigation";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import { JOURNEY_STAGE_META, getVehicleLabel, type Vehicle } from "@/lib/mock-data/vehicles";

type VehiclesListTableProps = {
  vehicles: Vehicle[];
};

export function VehiclesListTable({ vehicles }: VehiclesListTableProps) {
  const router = useRouter();

  const columns: DataTableColumn<Vehicle>[] = [
    {
      id: "code",
      header: "Código",
      cell: (vehicle) => <span className="font-medium">{vehicle.code}</span>,
      sortValue: (vehicle) => vehicle.code,
      className: "whitespace-nowrap",
    },
    {
      id: "plate",
      header: "Placa",
      cell: (vehicle) => vehicle.plate,
      sortValue: (vehicle) => vehicle.plate,
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (vehicle) => getVehicleLabel(vehicle),
      sortValue: (vehicle) => getVehicleLabel(vehicle),
    },
    {
      id: "owner",
      header: "Proprietário",
      cell: (vehicle) => getClientById(vehicle.clientId)?.name ?? "Cliente não encontrado",
      sortValue: (vehicle) => getClientById(vehicle.clientId)?.name ?? "",
    },
    {
      id: "journeyStage",
      header: "Jornada",
      cell: (vehicle) =>
        vehicle.journeyStage ? (
          <StatusBadge variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant}>
            {JOURNEY_STAGE_META[vehicle.journeyStage].label}
          </StatusBadge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortValue: (vehicle) =>
        vehicle.journeyStage ? JOURNEY_STAGE_META[vehicle.journeyStage].label : "",
    },
    {
      id: "mileage",
      header: "KM",
      cell: (vehicle) => (
        <span className="text-muted-foreground">{vehicle.mileage.toLocaleString("pt-BR")}</span>
      ),
      sortValue: (vehicle) => vehicle.mileage,
      className: "text-right",
    },
  ];

  const filters: DataTableFilter<Vehicle>[] = [
    {
      id: "journeyStage",
      label: "Jornada",
      options: Object.entries(JOURNEY_STAGE_META).map(([value, meta]) => ({
        label: meta.label,
        value,
      })),
      predicate: (vehicle, value) => vehicle.journeyStage === value,
    },
  ];

  return (
    <DataTable
      data={vehicles}
      columns={columns}
      getRowId={(vehicle) => vehicle.id}
      searchPlaceholder="Buscar por placa, veículo ou proprietário..."
      searchFn={(vehicle, query) =>
        vehicle.plate.toLowerCase().includes(query) ||
        vehicle.code.toLowerCase().includes(query) ||
        getVehicleLabel(vehicle).toLowerCase().includes(query) ||
        (getClientById(vehicle.clientId)?.name.toLowerCase().includes(query) ?? false)
      }
      filters={filters}
      onRowClick={(vehicle) => router.push(`/veiculos/${vehicle.id}`)}
      emptyMessage="Nenhum veículo encontrado."
    />
  );
}
