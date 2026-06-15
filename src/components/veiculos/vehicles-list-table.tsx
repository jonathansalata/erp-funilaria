"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleEditDialog } from "@/components/veiculos/vehicle-edit-dialog";
import type { Client } from "@/lib/mock-data/clients";
import { canDeleteVehicle, getVehicleSummary } from "@/lib/mock-data/crm";
import { getVehicleSlug } from "@/lib/slugs";
import type { Inspection } from "@/lib/mock-data/inspections";
import type { Quote } from "@/lib/mock-data/quotes-data";
import type { ServiceOrder } from "@/lib/mock-data/service-orders-data";
import { VEHICLE_STATUS_META, type Vehicle, type VehicleStatus } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehiclesListTableProps = {
  vehicles: Vehicle[];
  clients: Client[];
  quotes: Quote[];
  serviceOrders: ServiceOrder[];
  inspections: Inspection[];
};

export function VehiclesListTable({
  vehicles,
  clients,
  quotes,
  serviceOrders,
  inspections,
}: VehiclesListTableProps) {
  const router = useRouter();
  const changeVehicleStatus = useErpDataStore((state) => state.changeVehicleStatus);
  const deleteVehicle = useErpDataStore((state) => state.deleteVehicle);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | undefined>();

  function getClientName(clientId: string) {
    return clients.find((client) => client.id === clientId)?.name ?? "Cliente não encontrado";
  }

  const columns: DataTableColumn<Vehicle>[] = [
    {
      id: "plate",
      header: "Placa",
      cell: (vehicle) => <span className="font-medium">{vehicle.plate}</span>,
      sortValue: (vehicle) => vehicle.plate,
      className: "whitespace-nowrap",
    },
    {
      id: "client",
      header: "Cliente",
      cell: (vehicle) => getClientName(vehicle.clientId),
      sortValue: (vehicle) => getClientName(vehicle.clientId),
    },
    {
      id: "brand",
      header: "Marca",
      cell: (vehicle) => vehicle.brand,
      sortValue: (vehicle) => vehicle.brand,
    },
    {
      id: "model",
      header: "Modelo",
      cell: (vehicle) => vehicle.model,
      sortValue: (vehicle) => vehicle.model,
    },
    {
      id: "year",
      header: "Ano",
      cell: (vehicle) => vehicle.year,
      sortValue: (vehicle) => vehicle.year,
    },
    {
      id: "status",
      header: "Status Atual",
      cell: (vehicle) => {
        const meta = VEHICLE_STATUS_META[vehicle.status];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
      sortValue: (vehicle) => vehicle.status,
    },
    {
      id: "lastVisit",
      header: "Última Entrada",
      cell: (vehicle) => {
        const lastVisit = getVehicleSummary(vehicle, quotes, serviceOrders).lastVisit;
        return (
          <span className="text-muted-foreground">{lastVisit ? formatDate(lastVisit) : "-"}</span>
        );
      },
      sortValue: (vehicle) => getVehicleSummary(vehicle, quotes, serviceOrders).lastVisit ?? "",
      className: "whitespace-nowrap",
    },
    {
      id: "serviceOrders",
      header: "Total de OS",
      cell: (vehicle) => (
        <Badge variant="outline">
          {getVehicleSummary(vehicle, quotes, serviceOrders).totalServiceOrders}
        </Badge>
      ),
      sortValue: (vehicle) => getVehicleSummary(vehicle, quotes, serviceOrders).totalServiceOrders,
    },
    {
      id: "totalSpent",
      header: "Valor Gasto",
      cell: (vehicle) =>
        formatCurrency(getVehicleSummary(vehicle, quotes, serviceOrders).totalSpent),
      sortValue: (vehicle) => getVehicleSummary(vehicle, quotes, serviceOrders).totalSpent,
      className: "whitespace-nowrap",
    },
    {
      id: "actions",
      header: "Ações",
      cell: (vehicle) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" onClick={(event) => event.stopPropagation()}>
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem
              onClick={() => router.push(`/veiculos/${getVehicleSlug(vehicle, vehicles)}`)}
            >
              <Eye />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingVehicle(vehicle)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                changeVehicleStatus(vehicle.id, vehicle.status === "ativo" ? "inativo" : "ativo")
              }
            >
              <Power />
              {vehicle.status === "ativo" ? "Inativar" : "Ativar"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (!canDeleteVehicle(vehicle.id, quotes, serviceOrders, inspections)) {
                  toast.error(
                    "Este veículo possui vistoria, orçamento ou OS vinculado. Apenas a inativação é permitida.",
                  );
                  return;
                }
                setDeletingVehicle(vehicle);
              }}
            >
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  const filters: DataTableFilter<Vehicle>[] = [
    {
      id: "status",
      label: "Status",
      options: Object.entries(VEHICLE_STATUS_META).map(([value, meta]) => ({
        label: meta.label,
        value,
      })),
      predicate: (vehicle, value) => vehicle.status === (value as VehicleStatus),
    },
  ];

  return (
    <>
      <DataTable
        data={vehicles}
        columns={columns}
        getRowId={(vehicle) => vehicle.id}
        searchPlaceholder="Buscar por placa, veículo ou proprietário..."
        searchFn={(vehicle, query) =>
          vehicle.plate.toLowerCase().includes(query) ||
          vehicle.code.toLowerCase().includes(query) ||
          `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(query) ||
          getClientName(vehicle.clientId).toLowerCase().includes(query)
        }
        filters={filters}
        onRowClick={(vehicle) => router.push(`/veiculos/${getVehicleSlug(vehicle, vehicles)}`)}
        emptyMessage="Nenhum veículo encontrado."
      />

      <VehicleEditDialog
        open={Boolean(editingVehicle)}
        onOpenChange={(open) => !open && setEditingVehicle(undefined)}
        vehicle={editingVehicle}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingVehicle)}
        onOpenChange={(open) => !open && setDeletingVehicle(undefined)}
        onConfirm={() => {
          if (deletingVehicle) {
            deleteVehicle(deletingVehicle.id);
            toast.success("Veículo excluído com sucesso.");
          }
        }}
        itemLabel={deletingVehicle ? `o veículo ${deletingVehicle.plate}` : undefined}
      />
    </>
  );
}
