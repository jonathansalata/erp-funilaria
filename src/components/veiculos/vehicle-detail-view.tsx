"use client";

import { notFound } from "next/navigation";

import { VehicleDetail } from "@/components/veiculos/vehicle-detail";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehicleDetailViewProps = {
  id: string;
};

export function VehicleDetailView({ id }: VehicleDetailViewProps) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const vehicle = useErpDataStore((state) => state.vehicles.find((item) => item.id === id));
  const client = useErpDataStore((state) =>
    state.clients.find((item) => item.id === vehicle?.clientId),
  );
  const inspections = useErpDataStore((state) =>
    state.inspections.filter((inspection) => inspection.vehicleId === id),
  );
  const quotes = useErpDataStore((state) => state.quotes.filter((quote) => quote.vehicleId === id));
  const serviceOrders = useErpDataStore((state) =>
    state.serviceOrders.filter((order) => order.vehicleId === id),
  );
  const receivables = useErpDataStore((state) => state.receivables);
  const events = useErpDataStore((state) => state.events);

  if (!hasHydrated) {
    return null;
  }

  if (!vehicle) {
    notFound();
  }

  return (
    <VehicleDetail
      vehicle={vehicle}
      client={client}
      inspections={inspections}
      quotes={quotes}
      serviceOrders={serviceOrders}
      receivables={receivables}
      events={events}
    />
  );
}
