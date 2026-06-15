"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientEditDialog } from "@/components/clientes/client-edit-dialog";
import {
  CLIENT_STATUS_META,
  CLIENT_TYPE_LABELS,
  type Client,
  type ClientStatus,
} from "@/lib/mock-data/clients";
import { canDeleteClient, getClientSummary } from "@/lib/mock-data/crm";
import { getClientSlug } from "@/lib/slugs";
import type { Quote } from "@/lib/mock-data/quotes-data";
import type { ServiceOrder } from "@/lib/mock-data/service-orders-data";
import type { Receivable } from "@/lib/mock-data/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type ClientsListTableProps = {
  clients: Client[];
  quotes: Quote[];
  serviceOrders: ServiceOrder[];
  receivables: Receivable[];
};

export function ClientsListTable({
  clients,
  quotes,
  serviceOrders,
  receivables,
}: ClientsListTableProps) {
  const router = useRouter();
  const changeClientStatus = useErpDataStore((state) => state.changeClientStatus);
  const deleteClient = useErpDataStore((state) => state.deleteClient);

  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [deletingClient, setDeletingClient] = useState<Client | undefined>();

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
      header: "CPF/CNPJ",
      cell: (client) => <span className="text-muted-foreground">{client.document}</span>,
      sortValue: (client) => client.document,
    },
    {
      id: "phone",
      header: "Telefone",
      cell: (client) => <span className="text-muted-foreground">{client.phone}</span>,
    },
    {
      id: "vehicles",
      header: "Veículos",
      cell: (client) => <Badge variant="outline">{client.vehicleIds.length}</Badge>,
      sortValue: (client) => client.vehicleIds.length,
    },
    {
      id: "quotes",
      header: "Orçamentos",
      cell: (client) => (
        <Badge variant="outline">
          {getClientSummary(client, quotes, serviceOrders).totalQuotes}
        </Badge>
      ),
      sortValue: (client) => getClientSummary(client, quotes, serviceOrders).totalQuotes,
    },
    {
      id: "serviceOrders",
      header: "OS",
      cell: (client) => (
        <Badge variant="outline">
          {getClientSummary(client, quotes, serviceOrders).totalServiceOrders}
        </Badge>
      ),
      sortValue: (client) => getClientSummary(client, quotes, serviceOrders).totalServiceOrders,
    },
    {
      id: "totalSpent",
      header: "Valor Total Gasto",
      cell: (client) => formatCurrency(getClientSummary(client, quotes, serviceOrders).totalSpent),
      sortValue: (client) => getClientSummary(client, quotes, serviceOrders).totalSpent,
      className: "whitespace-nowrap",
    },
    {
      id: "lastVisit",
      header: "Última Visita",
      cell: (client) => {
        const lastVisit = getClientSummary(client, quotes, serviceOrders).lastVisit;
        return (
          <span className="text-muted-foreground">{lastVisit ? formatDate(lastVisit) : "-"}</span>
        );
      },
      sortValue: (client) => getClientSummary(client, quotes, serviceOrders).lastVisit ?? "",
      className: "whitespace-nowrap",
    },
    {
      id: "status",
      header: "Status",
      cell: (client) => {
        const meta = CLIENT_STATUS_META[client.status];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
      sortValue: (client) => client.status,
    },
    {
      id: "actions",
      header: "Ações",
      cell: (client) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" onClick={(event) => event.stopPropagation()}>
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem
              onClick={() => router.push(`/clientes/${getClientSlug(client, clients)}`)}
            >
              <Eye />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingClient(client)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                changeClientStatus(client.id, client.status === "ativo" ? "inativo" : "ativo")
              }
            >
              <Power />
              {client.status === "ativo" ? "Inativar" : "Ativar"}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (!canDeleteClient(client.id, quotes, serviceOrders, receivables)) {
                  toast.error(
                    "Este cliente possui orçamento aprovado, OS ou financeiro vinculado. Apenas a inativação é permitida.",
                  );
                  return;
                }
                setDeletingClient(client);
              }}
            >
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  const filters: DataTableFilter<Client>[] = [
    {
      id: "type",
      label: "Tipo",
      options: Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (client, value) => client.type === value,
    },
    {
      id: "status",
      label: "Status",
      options: Object.entries(CLIENT_STATUS_META).map(([value, meta]) => ({
        label: meta.label,
        value,
      })),
      predicate: (client, value) => client.status === (value as ClientStatus),
    },
    {
      id: "hasVehicle",
      label: "Possui veículo",
      options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ],
      predicate: (client, value) =>
        value === "sim" ? client.vehicleIds.length > 0 : client.vehicleIds.length === 0,
    },
    {
      id: "hasServiceOrder",
      label: "Possui OS",
      options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ],
      predicate: (client, value) => {
        const hasOrder = getClientSummary(client, quotes, serviceOrders).totalServiceOrders > 0;
        return value === "sim" ? hasOrder : !hasOrder;
      },
    },
    {
      id: "hasQuote",
      label: "Possui orçamento",
      options: [
        { label: "Sim", value: "sim" },
        { label: "Não", value: "nao" },
      ],
      predicate: (client, value) => {
        const hasQuote = getClientSummary(client, quotes, serviceOrders).totalQuotes > 0;
        return value === "sim" ? hasQuote : !hasQuote;
      },
    },
  ];

  return (
    <>
      <DataTable
        data={clients}
        columns={columns}
        getRowId={(client) => client.id}
        searchPlaceholder="Buscar por nome, código, documento ou telefone..."
        searchFn={(client, query) =>
          client.name.toLowerCase().includes(query) ||
          client.code.toLowerCase().includes(query) ||
          client.document.toLowerCase().includes(query) ||
          client.phone.toLowerCase().includes(query)
        }
        filters={filters}
        onRowClick={(client) => router.push(`/clientes/${getClientSlug(client, clients)}`)}
        emptyMessage="Nenhum cliente encontrado."
      />

      <ClientEditDialog
        open={Boolean(editingClient)}
        onOpenChange={(open) => !open && setEditingClient(undefined)}
        client={editingClient}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingClient)}
        onOpenChange={(open) => !open && setDeletingClient(undefined)}
        onConfirm={() => {
          if (deletingClient) {
            deleteClient(deletingClient.id);
            toast.success("Cliente excluído com sucesso.");
          }
        }}
        itemLabel={deletingClient ? `o cliente ${deletingClient.name}` : undefined}
      />
    </>
  );
}
