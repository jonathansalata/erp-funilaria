"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ServiceOrderDetailClient } from "@/components/ordens-servico/service-order-detail-client";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

type OrdemServicoDetailViewProps = {
  /** Código da OS na URL (ex: "os-2026-000089"), ou `id` legado. */
  code: string;
};

export function OrdemServicoDetailView({ code }: OrdemServicoDetailViewProps) {
  const router = useRouter();
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);

  const order =
    serviceOrders.find((item) => item.code.toLowerCase() === code.toLowerCase()) ??
    serviceOrders.find((item) => item.id === code);

  const isLegacyIdMatch = Boolean(order) && order!.code.toLowerCase() !== code.toLowerCase();

  useEffect(() => {
    if (isLegacyIdMatch && order) {
      router.replace(`/ordens-servico/${order.code.toLowerCase()}`);
    }
  }, [isLegacyIdMatch, order, router]);

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
