import { notFound } from "next/navigation";

import { VehicleDetail } from "@/components/veiculos/vehicle-detail";
import { getVehicleById } from "@/lib/mock-data/vehicles";

export default async function VeiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = getVehicleById(id);
  if (!vehicle) {
    notFound();
  }

  return <VehicleDetail vehicle={vehicle} />;
}
