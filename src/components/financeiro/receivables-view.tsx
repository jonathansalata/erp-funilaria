"use client";

import { useState } from "react";
import { AlertTriangle, CircleDollarSign, History, Plus, Wallet } from "lucide-react";

import { PaymentHistoryDialog } from "@/components/financeiro/payment-history-dialog";
import {
  ReceivableFormDialog,
  type ReceivableFormValues,
} from "@/components/financeiro/receivable-form-dialog";
import { ReceivePaymentDialog } from "@/components/financeiro/receive-payment-dialog";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { DocumentActions } from "@/components/shared/document-actions";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getClientById } from "@/lib/mock-data/clients";
import {
  getReceivableBalance,
  getReceivablesSummary,
  isOverdue,
  PAYMENT_METHOD_LABELS,
  RECEIVABLE_STATUS_META,
  type Receivable,
} from "@/lib/mock-data/financeiro";
import {
  addPdfTable,
  createPdfDocument,
  downloadPdf,
  printPdf,
  PDF_COLORS,
} from "@/lib/pdf/pdf-utils";
import { downloadCsv, formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

const RECEIVABLE_PDF_COLUMNS = [
  {
    header: "Cliente",
    value: (row: Receivable) => getClientById(row.clientId)?.name ?? "—",
  },
  { header: "Documento", value: (row: Receivable) => row.document },
  {
    header: "Valor",
    value: (row: Receivable) => formatCurrency(row.value),
    align: "right" as const,
  },
  {
    header: "Recebido",
    value: (row: Receivable) => formatCurrency(row.receivedValue ?? 0),
    align: "right" as const,
    colorize: () => PDF_COLORS.positive,
  },
  {
    header: "Saldo",
    value: (row: Receivable) => formatCurrency(getReceivableBalance(row)),
    align: "right" as const,
    colorize: (row: Receivable) => (getReceivableBalance(row) > 0 ? PDF_COLORS.pending : undefined),
  },
  { header: "Vencimento", value: (row: Receivable) => formatDate(row.dueDate) },
  {
    header: "Status",
    value: (row: Receivable) => RECEIVABLE_STATUS_META[row.status].label,
    colorize: (row: Receivable) => {
      if (row.status === "recebido") return PDF_COLORS.positive;
      if (row.status === "cancelado") return PDF_COLORS.negative;
      if (row.status === "aberto" || row.status === "parcial") return PDF_COLORS.pending;
      return undefined;
    },
  },
];

export function ReceivablesView() {
  const receivables = useErpDataStore((state) => state.receivables);
  const createReceivable = useErpDataStore((state) => state.createReceivable);
  const updateReceivable = useErpDataStore((state) => state.updateReceivable);
  const receiveReceivable = useErpDataStore((state) => state.receiveReceivable);
  const reverseReceivable = useErpDataStore((state) => state.reverseReceivable);
  const reverseReceivablePayment = useErpDataStore((state) => state.reverseReceivablePayment);
  const cancelReceivable = useErpDataStore((state) => state.cancelReceivable);
  const deleteReceivable = useErpDataStore((state) => state.deleteReceivable);

  const [formOpen, setFormOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | undefined>(undefined);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivingReceivable, setReceivingReceivable] = useState<Receivable | undefined>(undefined);
  const [deletingReceivable, setDeletingReceivable] = useState<Receivable | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyReceivable, setHistoryReceivable] = useState<Receivable | undefined>(undefined);
  const [cancelingReceivable, setCancelingReceivable] = useState<Receivable | undefined>(undefined);
  const [reversingReceivable, setReversingReceivable] = useState<Receivable | undefined>(undefined);

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

  function openHistory(receivable: Receivable) {
    setHistoryReceivable(receivable);
    setHistoryOpen(true);
  }

  function buildPdfDocument() {
    const { doc, contentStartY } = createPdfDocument({
      title: "Relatório de Contas a Receber",
      orientation: "landscape",
    });
    addPdfTable(doc, contentStartY, receivables, RECEIVABLE_PDF_COLUMNS);
    return doc;
  }

  function handleExportPdf() {
    downloadPdf(buildPdfDocument(), "contas-a-receber.pdf");
  }

  function handlePrint() {
    printPdf(buildPdfDocument());
  }

  function handleExportCsv() {
    downloadCsv(
      "contas-a-receber.csv",
      RECEIVABLE_PDF_COLUMNS.map((column) => column.header),
      receivables.map((row) => RECEIVABLE_PDF_COLUMNS.map((column) => column.value(row))),
    );
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
      id: "received",
      header: "Recebido",
      cell: (row) => formatCurrency(row.receivedValue ?? 0),
      sortValue: (row) => row.receivedValue ?? 0,
      className: "text-right",
    },
    {
      id: "balance",
      header: "Saldo",
      cell: (row) => formatCurrency(getReceivableBalance(row)),
      sortValue: (row) => getReceivableBalance(row),
      className: "text-right",
    },
    {
      id: "paymentMethods",
      header: "Forma de pagamento",
      cell: (row) => {
        const methods = [...new Set((row.payments ?? []).map((payment) => payment.method))];
        if (methods.length === 0) return "—";
        return methods.map((method) => PAYMENT_METHOD_LABELS[method]).join(", ");
      },
      className: "max-w-[180px] truncate",
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
            <Button size="sm" variant="outline" onClick={() => setReversingReceivable(row)}>
              Estornar
            </Button>
          )}
          {(row.payments?.length ?? 0) > 0 && (
            <Button size="sm" variant="outline" onClick={() => openHistory(row)}>
              <History />
              Histórico
            </Button>
          )}
          {row.status === "aberto" && (
            <Button size="sm" variant="outline" onClick={() => setCancelingReceivable(row)}>
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
        <div className="flex flex-wrap items-start gap-2">
          <DocumentActions
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
            onPrint={handlePrint}
          />
          <Button onClick={openNew}>
            <Plus />
            Novo título
          </Button>
        </div>
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
        onConfirm={(_amount, payments) =>
          receivingReceivable && receiveReceivable(receivingReceivable.id, payments)
        }
      />

      <PaymentHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title={historyReceivable?.document ?? ""}
        payments={historyReceivable?.payments}
        onReversePayment={(paymentId) =>
          historyReceivable && reverseReceivablePayment(historyReceivable.id, paymentId)
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

      <ConfirmActionDialog
        open={Boolean(cancelingReceivable)}
        onOpenChange={(open) => !open && setCancelingReceivable(undefined)}
        onConfirm={() => {
          if (cancelingReceivable) {
            cancelReceivable(cancelingReceivable.id);
          }
        }}
        title="Cancelar título"
        description={`Tem certeza de que deseja cancelar o título ${cancelingReceivable?.document ?? ""}? Esta ação pode ser registrada no histórico de auditoria.`}
        confirmLabel="Cancelar título"
        variant="destructive"
      />

      <ConfirmActionDialog
        open={Boolean(reversingReceivable)}
        onOpenChange={(open) => !open && setReversingReceivable(undefined)}
        onConfirm={() => {
          if (reversingReceivable) {
            reverseReceivable(reversingReceivable.id);
          }
        }}
        title="Estornar recebimento"
        description={`Tem certeza de que deseja estornar o recebimento do título ${reversingReceivable?.document ?? ""}? O valor recebido será revertido e o título voltará para "Aberto".`}
        confirmLabel="Estornar"
        variant="destructive"
      />
    </div>
  );
}
