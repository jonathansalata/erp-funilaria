import type { Client } from "@/lib/mock-data/clients";
import type { FinancialSummary, VehicleSummary } from "@/lib/mock-data/crm";
import { INSPECTION_STATUS_META, type Inspection } from "@/lib/mock-data/inspections";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal, type Quote } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { calculateServiceOrderTotal, type ServiceOrder } from "@/lib/mock-data/service-orders-data";
import {
  FUEL_TYPE_LABELS,
  getVehicleLabel,
  JOURNEY_STAGE_META,
  type Vehicle,
} from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { addPdfKeyValueSection, addPdfTable, createPdfDocument } from "@/lib/pdf/pdf-utils";

/** Monta o documento PDF da Ficha completa do veículo (Fase 2B.5 — Bloco 13). */
export function buildVehiclePdf(
  vehicle: Vehicle,
  client: Client | undefined,
  inspections: Inspection[],
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
  summary: VehicleSummary,
  financialSummary: FinancialSummary,
) {
  const { doc, contentStartY } = createPdfDocument({
    title: "Ficha do Veículo",
    subtitle: vehicle.code,
  });

  let y = addPdfKeyValueSection(doc, contentStartY, "Dados do veículo", [
    { label: "Veículo", value: getVehicleLabel(vehicle) },
    { label: "Placa", value: vehicle.plate },
    { label: "Cor", value: vehicle.color },
    { label: "KM", value: vehicle.mileage.toLocaleString("pt-BR") },
    { label: "Chassi", value: vehicle.chassi ?? "—" },
    { label: "Renavam", value: vehicle.renavam ?? "—" },
    { label: "Combustível", value: vehicle.fuel ? FUEL_TYPE_LABELS[vehicle.fuel] : "—" },
    {
      label: "Jornada atual",
      value: vehicle.journeyStage
        ? JOURNEY_STAGE_META[vehicle.journeyStage].label
        : "Fora do pátio",
    },
    { label: "Proprietário", value: client?.name ?? "—" },
  ]);

  y = addPdfKeyValueSection(doc, y + 10, "Resumo", [
    { label: "Total de orçamentos", value: String(summary.totalQuotes) },
    { label: "Total de OS", value: String(summary.totalServiceOrders) },
    { label: "Valor total gasto", value: formatCurrency(summary.totalSpent) },
    { label: "Última visita", value: summary.lastVisit ? formatDate(summary.lastVisit) : "—" },
  ]);

  y = addPdfKeyValueSection(doc, y + 10, "Financeiro", [
    { label: "Total faturado", value: formatCurrency(financialSummary.totalFaturado) },
    { label: "Total recebido", value: formatCurrency(financialSummary.totalRecebido) },
    { label: "Saldo pendente", value: formatCurrency(financialSummary.saldoPendente) },
  ]);

  if (inspections.length > 0) {
    y = addPdfTable(doc, y + 15, inspections, [
      { header: "Vistoria", value: (row: Inspection) => row.code },
      { header: "Data", value: (row: Inspection) => formatDateTime(row.createdAt) },
      { header: "Status", value: (row: Inspection) => INSPECTION_STATUS_META[row.status].title },
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
