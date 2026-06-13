import { OrdemServicoDetailView } from "@/components/ordens-servico/ordem-servico-detail-view";

export default async function OrdemServicoDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return <OrdemServicoDetailView code={code} />;
}
