"use client";

import { VehiclesListTable } from "@/components/veiculos/vehicles-list-table";
import { useErpDataStore } from "@/stores/erp-data-store";

export default function VeiculosPage() {
  const vehicles = useErpDataStore((state) => state.vehicles);
  const clients = useErpDataStore((state) => state.clients);
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const inspections = useErpDataStore((state) => state.inspections);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Veículos</h1>
        <p className="text-muted-foreground text-sm">
          Cadastro de veículos da oficina e sua etapa atual na jornada.
        </p>
      </div>

      <VehiclesListTable
        vehicles={vehicles}
        clients={clients}
        quotes={quotes}
        serviceOrders={serviceOrders}
        inspections={inspections}
      />
    </div>
  );
}
