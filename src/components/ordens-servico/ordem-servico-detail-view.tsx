"use client";

import Link from "next/link";

import { ServiceOrderDetailClient } from "@/components/ordens-servico/service-order-detail-client";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

type OrdemServicoDetailViewProps = {
  id: string;
};

export function OrdemServicoDetailView({ id }: OrdemServicoDetailViewProps) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const order = useErpDataStore((state) => state.serviceOrders.find((item) => item.id === id));

  if (!hasHydrated) {
    return null;
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Ordem de Serviço não encontrada</h1>
        <p className="text-muted-foreground text-sm">
          A ordem de serviço solicitada não existe ou foi removida.
        </p>
        <Button render={<Link href="/ordens-servico" />}>Voltar para ordens de serviço</Button>
      </div>
    );
  }

  return <ServiceOrderDetailClient order={order} />;
}
