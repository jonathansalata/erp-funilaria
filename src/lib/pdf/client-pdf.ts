import type { Client } from "@/lib/mock-data/clients";
import { CLIENT_TYPE_LABELS } from "@/lib/mock-data/clients";
import type { ClientSummary, FinancialSummary } from "@/lib/mock-data/crm";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal, type Quote } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { calculateServiceOrderTotal, type ServiceOrder } from "@/lib/mock-data/service-orders-data";
import { getVehicleLabel, type Vehicle } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { addPdfKeyValueSection, addPdfTable, createPdfDocument } from "@/lib/pdf/pdf-utils";

/** Monta o documento PDF da Ficha 360° do cliente (Fase 2B.5 — Bloco 12). */
export function buildClientPdf(
  client: Client,
  vehicles: Vehicle[],
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
  summary: ClientSummary,
  financialSummary: FinancialSummary,
) {
  const { doc, contentStartY } = createPdfDocument({
    title: "Ficha do Cliente",
    subtitle: client.code,
  });

  let y = addPdfKeyValueSection(doc, contentStartY, "Dados do cliente", [
    { label: "Nome", value: client.name },
    { label: "Tipo", value: CLIENT_TYPE_LABELS[client.type] },
    { label: "Documento", value: client.document },
    { label: "Telefone", value: client.phone },
    { label: "E-mail", value: client.email },
    { label: "Endereço", value: client.address },
    { label: "Cadastrado em", value: formatDateTime(client.createdAt) },
  ]);

  y = addPdfKeyValueSection(doc, y + 10, "Resumo", [
    { label: "Total de veículos", value: String(summary.totalVehicles) },
    { label: "Total de orçamentos", value: String(summary.totalQuotes) },
    { label: "Total de OS", value: String(summary.totalServiceOrders) },
    { label: "Valor total gasto", value: formatCurrency(summary.totalSpent) },
    { label: "Ticket médio", value: formatCurrency(summary.ticketMedio) },
    { label: "Última visita", value: summary.lastVisit ? formatDate(summary.lastVisit) : "—" },
  ]);

  y = addPdfKeyValueSection(doc, y + 10, "Financeiro", [
    { label: "Total faturado", value: formatCurrency(financialSummary.totalFaturado) },
    { label: "Total recebido", value: formatCurrency(financialSummary.totalRecebido) },
    { label: "Saldo pendente", value: formatCurrency(financialSummary.saldoPendente) },
  ]);

  if (vehicles.length > 0) {
    y = addPdfTable(doc, y + 15, vehicles, [
      { header: "Placa", value: (row: Vehicle) => row.plate },
      { header: "Veículo", value: (row: Vehicle) => getVehicleLabel(row) },
    ]);
  }

  if (quotes.length > 0) {
    y = addPdfTable(doc, y + 15, quotes, [
      { header: "Orçamento", value: (row: Quote) => row.code },
      { header: "Data", value: (row: Quote) => formatDate(row.updatedAt) },
      { header: "Status", value: (row: Quote) => QUOTE_STATUS_META[row.status].title },
      {
        header: "Valor",
        value: (row: Quote) => formatCurrency(calculateQuoteTotal(row.items).total),
        align: "right" as const,
      },
    ]);
  }

  if (serviceOrders.length > 0) {
    addPdfTable(doc, y + 15, serviceOrders, [
      { header: "OS", value: (row: ServiceOrder) => row.code },
      { header: "Previsão", value: (row: ServiceOrder) => formatDate(row.dueDate) },
      {
        header: "Status",
        value: (row: ServiceOrder) => SERVICE_ORDER_STATUS_META[row.status].title,
      },
      {
        header: "Valor",
        value: (row: ServiceOrder) => formatCurrency(calculateServiceOrderTotal(row.items)),
        align: "right" as const,
      },
    ]);
  }

  return doc;
}
