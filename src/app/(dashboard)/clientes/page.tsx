import Link from "next/link";
import { Car, Plus } from "lucide-react";

import { ClientsListTable } from "@/components/clientes/clients-list-table";
import { Button } from "@/components/ui/button";
import { CLIENTS } from "@/lib/mock-data/clients";

export default function ClientesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Clientes & Veículos</h1>
          <p className="text-muted-foreground text-sm">
            Cadastro de clientes e veículos vinculados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={<Link href="/veiculos" />}>
            <Car />
            Ver veículos
          </Button>
          <Button render={<Link href="/clientes/novo" />}>
            <Plus />
            Novo cliente
          </Button>
        </div>
      </div>

      <ClientsListTable clients={CLIENTS} />
    </div>
  );
}
