"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { ClientsListTable } from "@/components/clientes/clients-list-table";
import { Button } from "@/components/ui/button";
import { useErpDataStore } from "@/stores/erp-data-store";

export default function ClientesPage() {
  const clients = useErpDataStore((state) => state.clients);
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const receivables = useErpDataStore((state) => state.receivables);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Clientes</h1>
          <p className="text-muted-foreground text-sm">Cadastro e CRM de clientes da oficina.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button render={<Link href="/clientes/novo" />}>
            <Plus />
            Novo cliente
          </Button>
        </div>
      </div>

      <ClientsListTable
        clients={clients}
        quotes={quotes}
        serviceOrders={serviceOrders}
        receivables={receivables}
      />
    </div>
  );
}
