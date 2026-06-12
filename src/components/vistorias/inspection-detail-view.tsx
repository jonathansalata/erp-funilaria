"use client";

import Link from "next/link";

import { InspectionDetail } from "@/components/vistorias/inspection-detail";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

type InspectionDetailViewProps = {
  id: string;
};

export function InspectionDetailView({ id }: InspectionDetailViewProps) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const inspection = useErpDataStore((state) => state.inspections.find((item) => item.id === id));

  if (!hasHydrated) {
    return null;
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Vistoria não encontrada</h1>
        <p className="text-muted-foreground text-sm">
          A vistoria solicitada não existe ou foi removida.
        </p>
        <Button render={<Link href="/vistorias" />}>Voltar para vistorias</Button>
      </div>
    );
  }

  return <InspectionDetail inspection={inspection} />;
}
