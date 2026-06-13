import { OrcamentoDetailView } from "@/components/orcamentos/orcamento-detail-view";

export default async function OrcamentoDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <OrcamentoDetailView code={code} />;
}
