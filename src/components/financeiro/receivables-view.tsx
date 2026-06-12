"use client";

import { useState } from "react";
import { AlertTriangle, CircleDollarSign, Plus, Wallet } from "lucide-react";

import {
  ReceivableFormDialog,
  type ReceivableFormValues,
} from "@/components/financeiro/receivable-form-dialog";
import { ReceivePaymentDialog } from "@/components/financeiro/receive-payment-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getClientById } from "@/lib/mock-data/clients";
import {
  getReceivablesSummary,
  isOverdue,
  RECEIVABLE_STATUS_META,
  type Receivable,
} from "@/lib/mock-data/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

export function ReceivablesView() {
  const receivables = useErpDataStore((state) => state.receivables);
  const createReceivable = useErpDataStore((state) => state.createReceivable);
  const updateReceivable = useErpDataStore((state) => state.updateReceivable);
  const receiveReceivable = useErpDataStore((state) => state.receiveReceivable);
  const reverseReceivable = useErpDataStore((state) => state.reverseReceivable);
  const cancelReceivable = useErpDataStore((state) => state.cancelReceivable);
  const deleteReceivable = useErpDataStore((state) => state.deleteReceivable);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | undefined>(undefined);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivingReceivable, setReceivingReceivable] = useState<Receivable | undefined>(undefined);
  const [deletingReceivable, setDeletingReceivable] = useState<Receivable | undefined>(undefined);

  const summary = getReceivablesSummary(receivables);

  function openNew() {
    setEditingReceivable(undefined);
    setFormOpen(true);
  }

  function openEdit(receivable: Receivable) {
    setEditingReceivable(receivable);
    setFormOpen(true);
  }

  function handleSubmit(values: ReceivableFormValues) {
    if (editingReceivable) {
      updateReceivable(editingReceivable.id, values);
    } else {
      createReceivable(values);
    }
  }

  function openReceive(receivable: Receivable) {
    setReceivingReceivable(receivable);
    setReceiveOpen(true);
  }

  const columns: DataTableColumn<Receivable>[] = [
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      sortValue: (row) => getClientById(row.clientId)?.name ?? "",
    },
    {
      id: "document",
      header: "Documento",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.document}</span>
          {row.description && (
            <span className="text-muted-foreground text-xs">{row.description}</span>
          )}
        </div>
      ),
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      sortValue: (row) => row.value,
      className: "text-right",
    },
    {
      id: "dueDate",
      header: "Vencimento",
      cell: (row) => (
        <span
          className={
            isOverdue(row.dueDate, row.status, "aberto") ? "text-destructive font-medium" : ""
          }
        >
          {formatDate(row.dueDate)}
        </span>
      ),
      sortValue: (row) => row.dueDate,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={RECEIVABLE_STATUS_META[row.status].variant}>
          {RECEIVABLE_STATUS_META[row.status].label}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: (row) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          {(row.status === "aberto" || row.status === "parcial") && (
            <Button size="sm" variant="outline" onClick={() => openReceive(row)}>
              Receber
            </Button>
          )}
          {(row.status === "parcial" || row.status === "recebido") && (
            <Button size="sm" variant="outline" onClick={() => reverseReceivable(row.id)}>
              Estornar
            </Button>
          )}
          {row.status === "aberto" && (
            <Button size="sm" variant="outline" onClick={() => cancelReceivable(row.id)}>
              Cancelar
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            Editar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setDeletingReceivable(row)}>
            Excluir
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const filters: DataTableFilter<Receivable>[] = [
    {
      id: "status",
      label: "Status",
      options: Object.entries(RECEIVABLE_STATUS_META).map(([value, meta]) => ({
        label: meta.label,
        value,
      })),
      predicate: (row, value) => row.status === value,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Contas a Receber</h1>
          <p className="text-muted-foreground text-sm">
            Títulos a receber de clientes vinculados a orçamentos e ordens de serviço.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus />
          Novo título
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total em aberto"
          value={formatCurrency(summary.totalAberto)}
          icon={Wallet}
          description="Saldo de títulos abertos e parciais"
        />
        <KpiCard
          title="Recebido no mês"
          value={formatCurrency(summary.recebidoNoMes)}
          icon={CircleDollarSign}
          description="Total recebido no mês de referência"
        />
        <KpiCard
          title="Atrasados"
          value={String(summary.atrasadosCount)}
          icon={AlertTriangle}
          description={`${formatCurrency(summary.atrasadosValue)} em atraso`}
        />
      </div>

      <DataTable
        data={receivables}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Buscar por documento..."
        searchFn={(row, query) =>
          row.document.toLowerCase().includes(query) ||
          (getClientById(row.clientId)?.name.toLowerCase().includes(query) ?? false)
        }
        filters={filters}
        emptyMessage="Nenhum título a receber encontrado."
      />

      <ReceivableFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        receivable={editingReceivable}
        onSubmit={handleSubmit}
      />

      <ReceivePaymentDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        receivable={receivingReceivable}
        onConfirm={(value) =>
          receivingReceivable && receiveReceivable(receivingReceivable.id, value)
        }
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingReceivable)}
        onOpenChange={(open) => !open && setDeletingReceivable(undefined)}
        onConfirm={() => {
          if (deletingReceivable) {
            deleteReceivable(deletingReceivable.id);
          }
        }}
        itemLabel={deletingReceivable ? `o título ${deletingReceivable.document}` : undefined}
      />
    </div>
  );
}
