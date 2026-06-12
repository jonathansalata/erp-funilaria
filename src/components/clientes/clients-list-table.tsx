"use client";

import { useRouter } from "next/navigation";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/mock-data/clients";
import { formatDate } from "@/lib/utils";

type ClientsListTableProps = {
  clients: Client[];
};

const CLIENT_TYPE_LABELS: Record<Client["type"], string> = {
  pessoa_fisica: "Pessoa física",
  pessoa_juridica: "Pessoa jurídica",
};

export function ClientsListTable({ clients }: ClientsListTableProps) {
  const router = useRouter();

  const columns: DataTableColumn<Client>[] = [
    {
      id: "code",
      header: "Código",
      cell: (client) => <span className="font-medium">{client.code}</span>,
      sortValue: (client) => client.code,
      className: "whitespace-nowrap",
    },
    {
      id: "name",
      header: "Nome",
      cell: (client) => client.name,
      sortValue: (client) => client.name,
    },
    {
      id: "document",
      header: "Documento",
      cell: (client) => <span className="text-muted-foreground">{client.document}</span>,
      sortValue: (client) => client.document,
    },
    {
      id: "phone",
      header: "Telefone",
      cell: (client) => <span className="text-muted-foreground">{client.phone}</span>,
    },
    {
      id: "email",
      header: "Email",
      cell: (client) => <span className="text-muted-foreground">{client.email}</span>,
    },
    {
      id: "vehicles",
      header: "Veículos",
      cell: (client) => <Badge variant="outline">{client.vehicleIds.length}</Badge>,
      sortValue: (client) => client.vehicleIds.length,
    },
    {
      id: "createdAt",
      header: "Cadastrado em",
      cell: (client) => (
        <span className="text-muted-foreground">{formatDate(client.createdAt)}</span>
      ),
      sortValue: (client) => client.createdAt,
    },
  ];

  const filters: DataTableFilter<Client>[] = [
    {
      id: "type",
      label: "Tipo",
      options: Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (client, value) => client.type === value,
    },
  ];

  return (
    <DataTable
      data={clients}
      columns={columns}
      getRowId={(client) => client.id}
      searchPlaceholder="Buscar por nome, código ou documento..."
      searchFn={(client, query) =>
        client.name.toLowerCase().includes(query) ||
        client.code.toLowerCase().includes(query) ||
        client.document.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      }
      filters={filters}
      onRowClick={(client) => router.push(`/clientes/${client.id}`)}
      emptyMessage="Nenhum cliente encontrado."
    />
  );
}
