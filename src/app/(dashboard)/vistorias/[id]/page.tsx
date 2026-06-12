import { notFound } from "next/navigation";

import { InspectionDetail } from "@/components/vistorias/inspection-detail";
import { getInspectionById } from "@/lib/mock-data/inspections";

export default async function VistoriaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = getInspectionById(id);
  if (!inspection) {
    notFound();
  }

  return <InspectionDetail inspection={inspection} />;
}
