"use client";

import { notFound } from "next/navigation";

import { VehicleDetail } from "@/components/veiculos/vehicle-detail";
import { findVehicleBySlug } from "@/lib/slugs";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehicleDetailViewProps = {
  id: string;
};

export function VehicleDetailView({ id }: VehicleDetailViewProps) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const vehicles = useErpDataStore((state) => state.vehicles);
  const clients = useErpDataStore((state) => state.clients);
  const inspections = useErpDataStore((state) => state.inspections);
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const receivables = useErpDataStore((state) => state.receivables);
  const events = useErpDataStore((state) => state.events);

  const vehicle = findVehicleBySlug(vehicles, id);
  const client = clients.find((item) => item.id === vehicle?.clientId);

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
      inspections={inspections.filter((inspection) => inspection.vehicleId === vehicle.id)}
      quotes={quotes.filter((quote) => quote.vehicleId === vehicle.id)}
      serviceOrders={serviceOrders.filter((order) => order.vehicleId === vehicle.id)}
      receivables={receivables}
      events={events}
    />
  );
}
