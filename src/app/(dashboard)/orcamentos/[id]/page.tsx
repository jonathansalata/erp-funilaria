import { OrcamentoDetailView } from "@/components/orcamentos/orcamento-detail-view";

export default async function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <OrcamentoDetailView id={id} />;
}
