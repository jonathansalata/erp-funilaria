import { notFound } from "next/navigation";

import { ClientDetail } from "@/components/clientes/client-detail";
import { getClientById } from "@/lib/mock-data/clients";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} />;
}
