"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { InspectionsListTable } from "@/components/vistorias/inspections-list-table";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

function VistoriasContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? undefined;
  const inspections = useErpDataStore((state) => state.inspections);

  return <InspectionsListTable inspections={inspections} initialStatus={status} />;
}

export default function VistoriasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Vistorias</h1>
          <p className="text-muted-foreground text-sm">
            Checklist e registro fotográfico do veículo antes da elaboração do orçamento.
          </p>
        </div>
        <Button render={<Link href="/vistorias/novo" />}>
          <Plus />
          Nova vistoria
        </Button>
      </div>

      <Suspense>
        <VistoriasContent />
      </Suspense>
    </div>
  );
}
