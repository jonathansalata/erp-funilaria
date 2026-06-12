import { OrdemServicoDetailView } from "@/components/ordens-servico/ordem-servico-detail-view";

export default async function OrdemServicoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrdemServicoDetailView id={id} />;
}
