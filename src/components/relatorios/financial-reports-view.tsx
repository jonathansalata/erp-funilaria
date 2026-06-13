"use client";

import { useCallback, useMemo, useState } from "react";

import { ReportTable, type ReportColumn } from "@/components/relatorios/report-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLIENTS, getClientById } from "@/lib/mock-data/clients";
import {
  getCashFlowEntries,
  getDreSummary,
  getPayableBalance,
  getReceivableBalance,
  isOverdue,
  PAYABLE_STATUS_META,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STAGE_LABELS,
  RECEIVABLE_STATUS_META,
  type CashFlowEntry,
  type Payable,
  type PaymentEntry,
  type Receivable,
} from "@/lib/mock-data/financeiro";
import { getQuoteById } from "@/lib/mock-data/quotes-data";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { getServiceOrderById } from "@/lib/mock-data/service-orders-data";
import { getVehicleLabel, getVehicleLabelById, VEHICLES } from "@/lib/mock-data/vehicles";
import { PDF_COLORS } from "@/lib/pdf/pdf-utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type ReceiptRow = {
  id: string;
  receivable: Receivable;
  payment: PaymentEntry;
};

type PaymentRow = {
  id: string;
  payable: Payable;
  payment: PaymentEntry;
};

function getReceivableVehicleId(receivable: Receivable): string | undefined {
  if (receivable.quoteId) return getQuoteById(receivable.quoteId)?.vehicleId;
  if (receivable.serviceOrderId) return getServiceOrderById(receivable.serviceOrderId)?.vehicleId;
  return undefined;
}

const STATUS_OPTIONS = [
  { value: "aberto", label: "Aberto" },
  { value: "parcial", label: "Parcial" },
  { value: "recebido", label: "Recebido" },
  { value: "pago", label: "Pago" },
  { value: "cancelado", label: "Cancelado" },
];

const FINANCIAL_REPORT_TABS = [
  { value: "recebimentos", label: "Recebimentos" },
  { value: "pagamentos", label: "Pagamentos" },
  { value: "abertas", label: "Contas em aberto" },
  { value: "vencidas", label: "Contas vencidas" },
  { value: "parciais", label: "Pagamentos parciais" },
  { value: "por-forma", label: "Receitas por forma" },
  { value: "fluxo-caixa", label: "Fluxo de Caixa" },
  { value: "dre", label: "DRE" },
] as const;

/**
 * Relatórios Financeiros detalhados (Fase 2D): Recebimentos, Pagamentos, Contas em aberto,
 * Contas vencidas, Pagamentos parciais, Receitas por forma de pagamento, Fluxo de Caixa e DRE —
 * todos com exportação em PDF, CSV e impressão (diretriz global de PDF e impressão).
 */
export function FinancialReportsView() {
  const receivables = useErpDataStore((state) => state.receivables);
  const payables = useErpDataStore((state) => state.payables);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [clientId, setClientId] = useState("all");
  const [vehicleId, setVehicleId] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [activeReportTab, setActiveReportTab] = useState<string>(FINANCIAL_REPORT_TABS[0].value);

  const inDateRange = useCallback(
    (date: string) =>
      (!dateFrom || date.slice(0, 10) >= dateFrom) && (!dateTo || date.slice(0, 10) <= dateTo),
    [dateFrom, dateTo],
  );

  const receiptRows = useMemo(() => {
    const rows: ReceiptRow[] = [];
    for (const receivable of receivables) {
      for (const payment of receivable.payments ?? []) {
        rows.push({ id: payment.id, receivable, payment });
      }
    }
    return rows.filter((row) => {
      if (!inDateRange(row.payment.paidAt)) return false;
      if (clientId !== "all" && row.receivable.clientId !== clientId) return false;
      if (vehicleId !== "all" && getReceivableVehicleId(row.receivable) !== vehicleId) return false;
      if (paymentMethod !== "all" && row.payment.method !== paymentMethod) return false;
      if (status !== "all" && row.receivable.status !== status) return false;
      return true;
    });
  }, [receivables, clientId, vehicleId, paymentMethod, status, inDateRange]);

  const paymentRows = useMemo(() => {
    const rows: PaymentRow[] = [];
    for (const payable of payables) {
      for (const payment of payable.payments ?? []) {
        rows.push({ id: payment.id, payable, payment });
      }
    }
    return rows.filter((row) => {
      if (!inDateRange(row.payment.paidAt)) return false;
      if (paymentMethod !== "all" && row.payment.method !== paymentMethod) return false;
      if (status !== "all" && row.payable.status !== status) return false;
      return true;
    });
  }, [payables, paymentMethod, status, inDateRange]);

  const openReceivables = useMemo(
    () =>
      receivables.filter((item) => {
        if (item.status !== "aberto" && item.status !== "parcial") return false;
        if (clientId !== "all" && item.clientId !== clientId) return false;
        if (vehicleId !== "all" && getReceivableVehicleId(item) !== vehicleId) return false;
        if (!inDateRange(item.dueDate)) return false;
        return true;
      }),
    [receivables, clientId, vehicleId, inDateRange],
  );

  const openPayables = useMemo(
    () => payables.filter((item) => item.status === "aberto" && inDateRange(item.dueDate)),
    [payables, inDateRange],
  );

  const overdueReceivables = useMemo(
    () =>
      openReceivables.filter(
        (item) =>
          isOverdue(item.dueDate, item.status, "aberto") ||
          isOverdue(item.dueDate, item.status, "parcial"),
      ),
    [openReceivables],
  );

  const overduePayables = useMemo(
    () => openPayables.filter((item) => isOverdue(item.dueDate, item.status, "aberto")),
    [openPayables],
  );

  const partialReceivables = useMemo(
    () =>
      receivables.filter((item) => {
        if (item.status !== "parcial") return false;
        if (clientId !== "all" && item.clientId !== clientId) return false;
        if (vehicleId !== "all" && getReceivableVehicleId(item) !== vehicleId) return false;
        return true;
      }),
    [receivables, clientId, vehicleId],
  );

  const revenueByMethod = useMemo(() => {
    const monthPrefix = dateFrom ? dateFrom.slice(0, 7) : undefined;
    const result: { method: string; label: string; value: number }[] = [];
    for (const method of PAYMENT_METHODS) {
      let value = 0;
      for (const receivable of receivables) {
        for (const payment of receivable.payments ?? []) {
          if (payment.method !== method) continue;
          if (monthPrefix && !payment.paidAt.startsWith(monthPrefix)) continue;
          if (!monthPrefix && !inDateRange(payment.paidAt)) continue;
          value += payment.value;
        }
      }
      result.push({ method, label: PAYMENT_METHOD_LABELS[method], value });
    }
    return result;
  }, [receivables, dateFrom, inDateRange]);

  const totalRevenue = revenueByMethod.reduce((sum, item) => sum + item.value, 0);

  const cashFlowEntries = useMemo(() => {
    const all = getCashFlowEntries(receivables, payables);
    const filtered = all.filter((entry) => inDateRange(entry.date));

    if (paymentMethod === "all") return filtered;

    let accumulated = 0;
    return filtered.map((entry) => {
      const inflow = entry.inflowByMethod[paymentMethod as keyof typeof entry.inflowByMethod] ?? 0;
      const dailyBalance = inflow - entry.outflow;
      accumulated += dailyBalance;
      return { ...entry, inflow, dailyBalance, accumulatedBalance: accumulated };
    });
  }, [receivables, payables, paymentMethod, inDateRange]);

  const dreMonth = dateFrom ? dateFrom.slice(0, 7) : REFERENCE_DATE.slice(0, 7);
  const dre = getDreSummary(receivables, payables, dreMonth);
  const dreRows = [
    { id: "receita", label: "Receita bruta", value: dre.receitaBruta },
    { id: "custos", label: "(–) Custos", value: -dre.custos },
    { id: "resultado", label: "Resultado operacional", value: dre.resultadoOperacional },
    { id: "despesas", label: "(–) Despesas", value: -dre.despesas },
    { id: "lucro", label: "Lucro líquido", value: dre.lucro },
  ];

  const receiptColumns: ReportColumn<ReceiptRow>[] = [
    {
      id: "date",
      header: "Data",
      cell: (row) => formatDate(row.payment.paidAt),
      csvHeader: "Data",
      csvValue: (row) => formatDate(row.payment.paidAt),
      sortValue: (row) => row.payment.paidAt,
    },
    {
      id: "document",
      header: "Documento",
      cell: (row) => row.receivable.document,
      csvHeader: "Documento",
      csvValue: (row) => row.receivable.document,
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.receivable.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.receivable.clientId)?.name ?? "—",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (row) => {
        const id = getReceivableVehicleId(row.receivable);
        return id ? getVehicleLabelById(id) : "—";
      },
      csvHeader: "Veículo",
      csvValue: (row) => {
        const id = getReceivableVehicleId(row.receivable);
        return id ? getVehicleLabelById(id) : "—";
      },
    },
    {
      id: "method",
      header: "Forma de pagamento",
      cell: (row) => PAYMENT_METHOD_LABELS[row.payment.method],
      csvHeader: "Forma de pagamento",
      csvValue: (row) => PAYMENT_METHOD_LABELS[row.payment.method],
    },
    {
      id: "stage",
      header: "Etapa",
      cell: (row) => (row.payment.stage ? PAYMENT_STAGE_LABELS[row.payment.stage] : "—"),
      csvHeader: "Etapa",
      csvValue: (row) => (row.payment.stage ? PAYMENT_STAGE_LABELS[row.payment.stage] : "—"),
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.payment.value),
      csvHeader: "Valor",
      csvValue: (row) => row.payment.value,
      sortValue: (row) => row.payment.value,
      className: "text-right",
    },
  ];

  const paymentColumns: ReportColumn<PaymentRow>[] = [
    {
      id: "date",
      header: "Data",
      cell: (row) => formatDate(row.payment.paidAt),
      csvHeader: "Data",
      csvValue: (row) => formatDate(row.payment.paidAt),
      sortValue: (row) => row.payment.paidAt,
    },
    {
      id: "document",
      header: "Documento",
      cell: (row) => row.payable.code,
      csvHeader: "Documento",
      csvValue: (row) => row.payable.code,
    },
    {
      id: "supplier",
      header: "Fornecedor",
      cell: (row) => row.payable.supplier,
      csvHeader: "Fornecedor",
      csvValue: (row) => row.payable.supplier,
    },
    {
      id: "method",
      header: "Forma de pagamento",
      cell: (row) => PAYMENT_METHOD_LABELS[row.payment.method],
      csvHeader: "Forma de pagamento",
      csvValue: (row) => PAYMENT_METHOD_LABELS[row.payment.method],
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.payment.value),
      csvHeader: "Valor",
      csvValue: (row) => row.payment.value,
      sortValue: (row) => row.payment.value,
      className: "text-right",
    },
  ];

  const openReceivableColumns: ReportColumn<Receivable>[] = [
    {
      id: "document",
      header: "Documento",
      cell: (row) => row.document,
      csvHeader: "Documento",
      csvValue: (row) => row.document,
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.clientId)?.name ?? "—",
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      csvHeader: "Valor",
      csvValue: (row) => row.value,
      sortValue: (row) => row.value,
      className: "text-right",
    },
    {
      id: "balance",
      header: "Saldo",
      cell: (row) => formatCurrency(getReceivableBalance(row)),
      csvHeader: "Saldo",
      csvValue: (row) => getReceivableBalance(row),
      sortValue: (row) => getReceivableBalance(row),
      className: "text-right",
    },
    {
      id: "dueDate",
      header: "Vencimento",
      cell: (row) => formatDate(row.dueDate),
      csvHeader: "Vencimento",
      csvValue: (row) => formatDate(row.dueDate),
      sortValue: (row) => row.dueDate,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => RECEIVABLE_STATUS_META[row.status].label,
      csvHeader: "Status",
      csvValue: (row) => RECEIVABLE_STATUS_META[row.status].label,
    },
  ];

  const openPayableColumns: ReportColumn<Payable>[] = [
    {
      id: "document",
      header: "Documento",
      cell: (row) => row.code,
      csvHeader: "Documento",
      csvValue: (row) => row.code,
    },
    {
      id: "supplier",
      header: "Fornecedor",
      cell: (row) => row.supplier,
      csvHeader: "Fornecedor",
      csvValue: (row) => row.supplier,
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      csvHeader: "Valor",
      csvValue: (row) => row.value,
      sortValue: (row) => row.value,
      className: "text-right",
    },
    {
      id: "balance",
      header: "Saldo",
      cell: (row) => formatCurrency(getPayableBalance(row)),
      csvHeader: "Saldo",
      csvValue: (row) => getPayableBalance(row),
      sortValue: (row) => getPayableBalance(row),
      className: "text-right",
    },
    {
      id: "dueDate",
      header: "Vencimento",
      cell: (row) => formatDate(row.dueDate),
      csvHeader: "Vencimento",
      csvValue: (row) => formatDate(row.dueDate),
      sortValue: (row) => row.dueDate,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => PAYABLE_STATUS_META[row.status].label,
      csvHeader: "Status",
      csvValue: (row) => PAYABLE_STATUS_META[row.status].label,
    },
  ];

  const partialReceivableColumns: ReportColumn<Receivable>[] = [
    ...openReceivableColumns.slice(0, 3),
    {
      id: "received",
      header: "Recebido",
      cell: (row) => formatCurrency(row.receivedValue ?? 0),
      csvHeader: "Recebido",
      csvValue: (row) => row.receivedValue ?? 0,
      sortValue: (row) => row.receivedValue ?? 0,
      className: "text-right",
    },
    ...openReceivableColumns.slice(3),
  ];

  const revenueByMethodColumns: ReportColumn<{ method: string; label: string; value: number }>[] = [
    {
      id: "label",
      header: "Forma de pagamento",
      cell: (row) => row.label,
      csvHeader: "Forma de pagamento",
      csvValue: (row) => row.label,
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      csvHeader: "Valor",
      csvValue: (row) => row.value,
      sortValue: (row) => row.value,
      className: "text-right",
    },
    {
      id: "percentage",
      header: "% do total",
      cell: (row) =>
        totalRevenue > 0 ? `${((row.value / totalRevenue) * 100).toFixed(1)}%` : "0%",
      csvHeader: "% do total",
      csvValue: (row) =>
        totalRevenue > 0 ? `${((row.value / totalRevenue) * 100).toFixed(1)}%` : "0%",
      className: "text-right",
    },
  ];

  const cashFlowColumns: ReportColumn<CashFlowEntry>[] = [
    {
      id: "date",
      header: "Data",
      cell: (row) => formatDate(row.date),
      csvHeader: "Data",
      csvValue: (row) => formatDate(row.date),
      sortValue: (row) => row.date,
    },
    {
      id: "inflow",
      header: "Entradas",
      cell: (row) => formatCurrency(row.inflow),
      csvHeader: "Entradas",
      csvValue: (row) => row.inflow,
      className: "text-right",
    },
    {
      id: "outflow",
      header: "Saídas",
      cell: (row) => formatCurrency(row.outflow),
      csvHeader: "Saídas",
      csvValue: (row) => row.outflow,
      className: "text-right",
    },
    {
      id: "dailyBalance",
      header: "Saldo diário",
      cell: (row) => formatCurrency(row.dailyBalance),
      csvHeader: "Saldo diário",
      csvValue: (row) => row.dailyBalance,
      className: "text-right",
    },
    {
      id: "accumulatedBalance",
      header: "Saldo acumulado",
      cell: (row) => formatCurrency(row.accumulatedBalance),
      csvHeader: "Saldo acumulado",
      csvValue: (row) => row.accumulatedBalance,
      className: "text-right",
    },
  ];

  const dreColumns: ReportColumn<{ id: string; label: string; value: number }>[] = [
    {
      id: "label",
      header: "Indicador",
      cell: (row) => row.label,
      csvHeader: "Indicador",
      csvValue: (row) => row.label,
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      csvHeader: "Valor",
      csvValue: (row) => row.value,
      className: "text-right",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fr-date-from">Data de</Label>
          <Input
            id="fr-date-from"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fr-date-to">Data até</Label>
          <Input
            id="fr-date-to"
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fr-client">Cliente</Label>
          <Select value={clientId} onValueChange={(value) => value && setClientId(value as string)}>
            <SelectTrigger id="fr-client" className="w-full">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {CLIENTS.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fr-vehicle">Veículo</Label>
          <Select
            value={vehicleId}
            onValueChange={(value) => value && setVehicleId(value as string)}
          >
            <SelectTrigger id="fr-vehicle" className="w-full">
              <SelectValue placeholder="Veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {VEHICLES.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} — {getVehicleLabel(vehicle)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fr-method">Forma de pagamento</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => value && setPaymentMethod(value as string)}
          >
            <SelectTrigger id="fr-method" className="w-full">
              <SelectValue placeholder="Forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fr-status">Status</Label>
          <Select value={status} onValueChange={(value) => value && setStatus(value as string)}>
            <SelectTrigger id="fr-status" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={activeReportTab}
        onValueChange={(value) => value && setActiveReportTab(value as string)}
      >
        <div className="sm:hidden">
          <Select
            value={activeReportTab}
            onValueChange={(value) => value && setActiveReportTab(value as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINANCIAL_REPORT_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TabsList className="hidden flex-wrap sm:flex">
          {FINANCIAL_REPORT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="recebimentos" className="pt-4">
          <ReportTable
            title="Recebimentos"
            description="Lançamentos de recebimento por forma de pagamento, com filtros aplicados"
            data={receiptRows}
            columns={receiptColumns}
            getRowId={(row) => row.id}
            filename="relatorio-recebimentos.csv"
          />
        </TabsContent>

        <TabsContent value="pagamentos" className="pt-4">
          <ReportTable
            title="Pagamentos"
            description="Lançamentos de pagamento a fornecedores por forma de pagamento"
            data={paymentRows}
            columns={paymentColumns}
            getRowId={(row) => row.id}
            filename="relatorio-pagamentos.csv"
          />
        </TabsContent>

        <TabsContent value="abertas" className="flex flex-col gap-4 pt-4">
          <ReportTable
            title="Contas a Receber em Aberto"
            description="Títulos com saldo pendente (abertos ou parciais)"
            data={openReceivables}
            columns={openReceivableColumns}
            getRowId={(row) => row.id}
            filename="relatorio-contas-a-receber-abertas.csv"
          />
          <ReportTable
            title="Contas a Pagar em Aberto"
            description="Contas a pagar com status aberto"
            data={openPayables}
            columns={openPayableColumns}
            getRowId={(row) => row.id}
            filename="relatorio-contas-a-pagar-abertas.csv"
            pdfColumns={openPayableColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: Payable) => String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize: column.id === "status" ? () => PDF_COLORS.pending : undefined,
            }))}
          />
        </TabsContent>

        <TabsContent value="vencidas" className="flex flex-col gap-4 pt-4">
          <ReportTable
            title="Contas a Receber Vencidas"
            description="Títulos com vencimento anterior à data de referência e ainda não recebidos"
            data={overdueReceivables}
            columns={openReceivableColumns}
            getRowId={(row) => row.id}
            filename="relatorio-contas-a-receber-vencidas.csv"
            pdfColumns={openReceivableColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: Receivable) => String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize: column.id === "balance" ? () => PDF_COLORS.negative : undefined,
            }))}
          />
          <ReportTable
            title="Contas a Pagar Vencidas"
            description="Contas a pagar com vencimento anterior à data de referência e ainda não pagas"
            data={overduePayables}
            columns={openPayableColumns}
            getRowId={(row) => row.id}
            filename="relatorio-contas-a-pagar-vencidas.csv"
            pdfColumns={openPayableColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: Payable) => String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize: column.id === "balance" ? () => PDF_COLORS.negative : undefined,
            }))}
          />
        </TabsContent>

        <TabsContent value="parciais" className="pt-4">
          <ReportTable
            title="Pagamentos Parciais"
            description="Contas a receber com recebimento parcial e saldo pendente"
            data={partialReceivables}
            columns={partialReceivableColumns}
            getRowId={(row) => row.id}
            filename="relatorio-pagamentos-parciais.csv"
            pdfColumns={partialReceivableColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: Receivable) => String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize: column.id === "balance" ? () => PDF_COLORS.pending : undefined,
            }))}
          />
        </TabsContent>

        <TabsContent value="por-forma" className="pt-4">
          <ReportTable
            title="Receitas por Forma de Pagamento"
            description={`Total recebido por forma de pagamento${dateFrom ? ` — ${formatDate(dateFrom)}${dateTo ? ` a ${formatDate(dateTo)}` : " em diante"}` : ""}`}
            data={revenueByMethod}
            columns={revenueByMethodColumns}
            getRowId={(row) => row.method}
            filename="relatorio-receitas-por-forma.csv"
            pdfOrientation="portrait"
            pdfColumns={revenueByMethodColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: { method: string; label: string; value: number }) =>
                String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize: column.id === "value" ? () => PDF_COLORS.positive : undefined,
            }))}
          />
        </TabsContent>

        <TabsContent value="fluxo-caixa" className="pt-4">
          <ReportTable
            title="Fluxo de Caixa"
            description="Movimentações diárias de entradas e saídas"
            data={cashFlowEntries}
            columns={cashFlowColumns}
            getRowId={(row) => row.date}
            filename="relatorio-fluxo-de-caixa.csv"
            pdfColumns={cashFlowColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: CashFlowEntry) => String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize:
                column.id === "inflow"
                  ? () => PDF_COLORS.positive
                  : column.id === "outflow"
                    ? () => PDF_COLORS.negative
                    : undefined,
            }))}
          />
        </TabsContent>

        <TabsContent value="dre" className="pt-4">
          <ReportTable
            title="DRE Gerencial"
            description={`Demonstrativo de resultado do período ${dreMonth}`}
            data={dreRows}
            columns={dreColumns}
            getRowId={(row) => row.id}
            filename="relatorio-dre.csv"
            pdfOrientation="portrait"
            pdfColumns={dreColumns.map((column) => ({
              header: column.csvHeader,
              value: (row: { id: string; label: string; value: number }) =>
                String(column.csvValue(row)),
              align: column.className?.includes("text-right") ? ("right" as const) : undefined,
              colorize:
                column.id === "value"
                  ? (row: { id: string; label: string; value: number }) =>
                      row.value < 0 ? PDF_COLORS.negative : PDF_COLORS.positive
                  : undefined,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
