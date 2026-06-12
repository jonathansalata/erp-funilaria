import Link from "next/link";
import { Plus } from "lucide-react";

import { OrcamentosView } from "@/components/orcamentos/orcamentos-view";
import { Button } from "@/components/ui/button";

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Pipeline de Orçamentos</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe os orçamentos por etapa, do rascunho à aprovação do cliente.
          </p>
        </div>
        <Button render={<Link href="/orcamentos/novo" />}>
          <Plus />
          Novo orçamento
        </Button>
      </div>

      <OrcamentosView initialStatus={status} />
    </div>
  );
}
