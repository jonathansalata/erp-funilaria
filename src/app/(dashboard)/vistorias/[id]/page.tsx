import { InspectionDetailView } from "@/components/vistorias/inspection-detail-view";

export default async function VistoriaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <InspectionDetailView id={id} />;
}
