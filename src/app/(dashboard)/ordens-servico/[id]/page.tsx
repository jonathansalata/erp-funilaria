import { notFound } from "next/navigation";

import { ServiceOrderDetailClient } from "@/components/ordens-servico/service-order-detail-client";
import { getServiceOrderById } from "@/lib/mock-data/service-orders-data";

export default async function OrdemServicoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getServiceOrderById(id);
  if (!order) {
    notFound();
  }

  return <ServiceOrderDetailClient order={order} />;
}
