"use client";

import { notFound } from "next/navigation";

import { VehicleDetail } from "@/components/veiculos/vehicle-detail";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehicleDetailViewProps = {
  id: string;
};

export function VehicleDetailView({ id }: VehicleDetailViewProps) {
  const vehicle = useErpDataStore((state) => state.vehicles.find((item) => item.id === id));
  const inspections = useErpDataStore((state) =>
    state.inspections.filter((inspection) => inspection.vehicleId === id),
  );

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetail vehicle={vehicle} inspections={inspections} />;
}
