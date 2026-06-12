import { VehicleDetailView } from "@/components/veiculos/vehicle-detail-view";

export default async function VeiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <VehicleDetailView id={id} />;
}
