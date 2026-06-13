"use client";

import { useState } from "react";
import { AlertTriangle, CircleDollarSign, History, Plus, Wallet } from "lucide-react";

import {
  PayableFormDialog,
  type PayableFormValues,
} from "@/components/financeiro/payable-form-dialog";
import { PayPayableDialog } from "@/components/financeiro/pay-payable-dialog";
import { PaymentHistoryDialog } from "@/components/financeiro/payment-history-dialog";
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
import {
  getPayablesSummary,
  isOverdue,
  PAYABLE_CATEGORY_LABELS,
  PAYABLE_STATUS_META,
  PAYMENT_METHOD_LABELS,
  type Payable,
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

const PAYABLE_PDF_COLUMNS = [
  { header: "Fornecedor", value: (row: Payable) => row.supplier },
  { header: "Categoria", value: (row: Payable) => PAYABLE_CATEGORY_LABELS[row.category] },
  {
    header: "Valor",
    value: (row: Payable) => formatCurrency(row.value),
    align: "right" as const,
    colorize: () => PDF_COLORS.negative,
  },
  { header: "Vencimento", value: (row: Payable) => formatDate(row.dueDate) },
  {
    header: "Status",
    value: (row: Payable) => PAYABLE_STATUS_META[row.status].label,
    colorize: (row: Payable) => {
      if (row.status === "pago") return PDF_COLORS.positive;
      if (row.status === "cancelado") return PDF_COLORS.negative;
      if (row.status === "aberto") return PDF_COLORS.pending;
      return undefined;
    },
  },
];

export function PayablesView() {
  const payables = useErpDataStore((state) => state.payables);
  const createPayable = useErpDataStore((state) => state.createPayable);
  const updatePayable = useErpDataStore((state) => state.updatePayable);
  const payPayable = useErpDataStore((state) => state.payPayable);
  const reversePayable = useErpDataStore((state) => state.reversePayable);
  const reversePayablePayment = useErpDataStore((state) => state.reversePayablePayment);
  const cancelPayable = useErpDataStore((state) => state.cancelPayable);
  const deletePayable = useErpDataStore((state) => state.deletePayable);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<Payable | undefined>(undefined);
  const [deletingPayable, setDeletingPayable] = useState<Payable | undefined>(undefined);
  const [payOpen, setPayOpen] = useState(false);
  const [payingPayable, setPayingPayable] = useState<Payable | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPayable, setHistoryPayable] = useState<Payable | undefined>(undefined);
  const [cancelingPayable, setCancelingPayable] = useState<Payable | undefined>(undefined);
  const [reversingPayable, setReversingPayable] = useState<Payable | undefined>(undefined);

  const summary = getPayablesSummary(payables);

  function openNew() {
    setEditingPayable(undefined);
    setFormOpen(true);
  }

  function openEdit(payable: Payable) {
    setEditingPayable(payable);
    setFormOpen(true);
  }

  function handleSubmit(values: PayableFormValues) {
    if (editingPayable) {
      updatePayable(editingPayable.id, values);
    } else {
      createPayable(values);
    }
  }

  function openPay(payable: Payable) {
    setPayingPayable(payable);
    setPayOpen(true);
  }

  function openHistory(payable: Payable) {
    setHistoryPayable(payable);
    setHistoryOpen(true);
  }

  function buildPdfDocument() {
    const { doc, contentStartY } = createPdfDocument({
      title: "Relatório de Contas a Pagar",
      orientation: "landscape",
    });
    addPdfTable(doc, contentStartY, payables, PAYABLE_PDF_COLUMNS);
    return doc;
  }

  function handleExportPdf() {
    downloadPdf(buildPdfDocument(), "contas-a-pagar.pdf");
  }

  function handlePrint() {
    printPdf(buildPdfDocument());
  }

  function handleExportCsv() {
    downloadCsv(
      "contas-a-pagar.csv",
      PAYABLE_PDF_COLUMNS.map((column) => column.header),
      payables.map((row) => PAYABLE_PDF_COLUMNS.map((column) => column.value(row))),
    );
  }

  const columns: DataTableColumn<Payable>[] = [
    {
      id: "supplier",
      header: "Fornecedor",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.supplier}</span>
          {row.description && (
            <span className="text-muted-foreground text-xs">{row.description}</span>
          )}
        </div>
      ),
      sortValue: (row) => row.supplier,
    },
    {
      id: "category",
      header: "Categoria",
      cell: (row) => PAYABLE_CATEGORY_LABELS[row.category],
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
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={PAYABLE_STATUS_META[row.status].variant}>
          {PAYABLE_STATUS_META[row.status].label}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: (row) => (
        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
          {row.status === "aberto" && (
            <Button size="sm" variant="outline" onClick={() => openPay(row)}>
              Pagar
            </Button>
          )}
          {row.status === "pago" && (
            <Button size="sm" variant="outline" onClick={() => setReversingPayable(row)}>
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
            <Button size="sm" variant="outline" onClick={() => setCancelingPayable(row)}>
              Cancelar
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
            Editar
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setDeletingPayable(row)}>
            Excluir
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const filters: DataTableFilter<Payable>[] = [
    {
      id: "status",
      label: "Status",
      options: Object.entries(PAYABLE_STATUS_META).map(([value, meta]) => ({
        label: meta.label,
        value,
      })),
      predicate: (row, value) => row.status === value,
    },
    {
      id: "category",
      label: "Categoria",
      options: Object.entries(PAYABLE_CATEGORY_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
      predicate: (row, value) => row.category === value,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Contas a Pagar</h1>
          <p className="text-muted-foreground text-sm">
            Contas a pagar a fornecedores e despesas operacionais da oficina.
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
            Nova conta
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total em aberto"
          value={formatCurrency(summary.totalAberto)}
          icon={Wallet}
          description="Saldo de contas abertas"
        />
        <KpiCard
          title="Pago no mês"
          value={formatCurrency(summary.pagoNoMes)}
          icon={CircleDollarSign}
          description="Total pago no mês de referência"
        />
        <KpiCard
          title="Vencidos"
          value={String(summary.vencidosCount)}
          icon={AlertTriangle}
          description={`${formatCurrency(summary.vencidosValue)} em atraso`}
        />
      </div>

      <DataTable
        data={payables}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Buscar por fornecedor..."
        searchFn={(row, query) => row.supplier.toLowerCase().includes(query)}
        filters={filters}
        emptyMessage="Nenhuma conta a pagar encontrada."
      />

      <PayableFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        payable={editingPayable}
        onSubmit={handleSubmit}
      />

      <PayPayableDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        payable={payingPayable}
        onConfirm={(payments) => payingPayable && payPayable(payingPayable.id, payments)}
      />

      <PaymentHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title={historyPayable?.supplier ?? ""}
        payments={historyPayable?.payments}
        onReversePayment={(paymentId) =>
          historyPayable && reversePayablePayment(historyPayable.id, paymentId)
        }
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingPayable)}
        onOpenChange={(open) => !open && setDeletingPayable(undefined)}
        onConfirm={() => {
          if (deletingPayable) {
            deletePayable(deletingPayable.id);
          }
        }}
        itemLabel={deletingPayable ? `a conta a pagar de ${deletingPayable.supplier}` : undefined}
      />

      <ConfirmActionDialog
        open={Boolean(cancelingPayable)}
        onOpenChange={(open) => !open && setCancelingPayable(undefined)}
        onConfirm={() => {
          if (cancelingPayable) {
            cancelPayable(cancelingPayable.id);
          }
        }}
        title="Cancelar conta a pagar"
        description={`Tem certeza de que deseja cancelar a conta a pagar de ${cancelingPayable?.supplier ?? ""}? Esta ação pode ser registrada no histórico de auditoria.`}
        confirmLabel="Cancelar conta"
        variant="destructive"
      />

      <ConfirmActionDialog
        open={Boolean(reversingPayable)}
        onOpenChange={(open) => !open && setReversingPayable(undefined)}
        onConfirm={() => {
          if (reversingPayable) {
            reversePayable(reversingPayable.id);
          }
        }}
        title="Estornar pagamento"
        description={`Tem certeza de que deseja estornar o pagamento da conta de ${reversingPayable?.supplier ?? ""}? O valor pago será revertido e a conta voltará para "Aberto".`}
        confirmLabel="Estornar"
        variant="destructive"
      />
    </div>
  );
}
