import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { VehiclesListTable } from "@/components/veiculos/vehicles-list-table";
import { Button } from "@/components/ui/button";
import { VEHICLES } from "@/lib/mock-data/vehicles";

export default function VeiculosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/clientes" />}>
          <ChevronLeft />
          Voltar
        </Button>
        <h1 className="font-heading text-2xl font-semibold">Veículos</h1>
        <p className="text-muted-foreground text-sm">
          Todos os veículos cadastrados e sua etapa atual na jornada.
        </p>
      </div>

      <VehiclesListTable vehicles={VEHICLES} />
    </div>
  );
}
