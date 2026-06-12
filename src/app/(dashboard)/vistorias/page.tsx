import Link from "next/link";
import { Plus } from "lucide-react";

import { InspectionsListTable } from "@/components/vistorias/inspections-list-table";
import { Button } from "@/components/ui/button";
import { INSPECTIONS } from "@/lib/mock-data/inspections";

export default async function VistoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

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

      <InspectionsListTable inspections={INSPECTIONS} initialStatus={status} />
    </div>
  );
}
