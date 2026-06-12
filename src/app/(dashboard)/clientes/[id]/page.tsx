import { ClientDetailView } from "@/components/clientes/client-detail-view";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ClientDetailView id={id} />;
}
