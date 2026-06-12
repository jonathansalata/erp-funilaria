import type { Client } from "@/lib/mock-data/clients";
import type { Receivable } from "@/lib/mock-data/financeiro";
import type { Inspection } from "@/lib/mock-data/inspections";
import type { Quote } from "@/lib/mock-data/quotes-data";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { calculateServiceOrderTotal, type ServiceOrder } from "@/lib/mock-data/service-orders-data";
import type { Vehicle } from "@/lib/mock-data/vehicles";

/**
 * Helpers de agregação para a Ficha 360° do cliente e a Ficha completa do veículo
 * (Fase 2C). Tudo é calculado em memória a partir dos arrays já existentes na store
 * (quotes, serviceOrders, receivables) — sem novas fontes de dados persistentes.
 */

export type ClientSummary = {
  totalVehicles: number;
  totalQuotes: number;
  totalServiceOrders: number;
  totalSpent: number;
  ticketMedio: number;
  lastVisit: string | null;
  daysSinceLastVisit: number | null;
};

export type VehicleSummary = {
  totalQuotes: number;
  totalServiceOrders: number;
  totalSpent: number;
  lastVisit: string | null;
};

export type FinancialSummary = {
  totalFaturado: number;
  totalRecebido: number;
  saldoPendente: number;
  lastPaymentAt: string | null;
};

function daysBetween(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function latestDate(dates: string[]): string | null {
  if (dates.length === 0) return null;
  return dates.reduce((latest, current) => (current > latest ? current : latest));
}

export function getClientSummary(
  client: Client,
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
): ClientSummary {
  const clientQuotes = quotes.filter((quote) => quote.clientId === client.id);
  const clientOrders = serviceOrders.filter((order) => order.clientId === client.id);

  const totalSpent = clientOrders.reduce(
    (sum, order) => sum + calculateServiceOrderTotal(order.items),
    0,
  );

  const visitDates = [
    ...clientOrders.map((order) => order.updatedAt),
    ...clientQuotes.map((quote) => quote.updatedAt),
  ];
  const lastVisit = latestDate(visitDates);

  return {
    totalVehicles: client.vehicleIds.length,
    totalQuotes: clientQuotes.length,
    totalServiceOrders: clientOrders.length,
    totalSpent,
    ticketMedio: clientOrders.length > 0 ? totalSpent / clientOrders.length : 0,
    lastVisit,
    daysSinceLastVisit: lastVisit ? daysBetween(lastVisit, REFERENCE_DATE) : null,
  };
}

export function getVehicleSummary(
  vehicle: Vehicle,
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
): VehicleSummary {
  const vehicleQuotes = quotes.filter((quote) => quote.vehicleId === vehicle.id);
  const vehicleOrders = serviceOrders.filter((order) => order.vehicleId === vehicle.id);

  const totalSpent = vehicleOrders.reduce(
    (sum, order) => sum + calculateServiceOrderTotal(order.items),
    0,
  );

  const visitDates = [
    ...vehicleOrders.map((order) => order.updatedAt),
    ...vehicleQuotes.map((quote) => quote.updatedAt),
  ];

  return {
    totalQuotes: vehicleQuotes.length,
    totalServiceOrders: vehicleOrders.length,
    totalSpent,
    lastVisit: latestDate(visitDates),
  };
}

export function getClientFinancialSummary(
  clientId: string,
  receivables: Receivable[],
): FinancialSummary {
  const clientReceivables = receivables.filter((receivable) => receivable.clientId === clientId);

  const totalFaturado = clientReceivables.reduce((sum, item) => sum + item.value, 0);
  const totalRecebido = clientReceivables.reduce((sum, item) => sum + (item.receivedValue ?? 0), 0);

  const paymentDates = clientReceivables
    .map((item) => item.receivedAt)
    .filter((date): date is string => Boolean(date));

  return {
    totalFaturado,
    totalRecebido,
    saldoPendente: totalFaturado - totalRecebido,
    lastPaymentAt: latestDate(paymentDates),
  };
}

export function getVehicleFinancialSummary(
  vehicleId: string,
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
  receivables: Receivable[],
): FinancialSummary {
  const vehicleQuoteIds = new Set(
    quotes.filter((quote) => quote.vehicleId === vehicleId).map((quote) => quote.id),
  );
  const vehicleOrderIds = new Set(
    serviceOrders.filter((order) => order.vehicleId === vehicleId).map((order) => order.id),
  );

  const vehicleReceivables = receivables.filter(
    (item) =>
      (item.quoteId && vehicleQuoteIds.has(item.quoteId)) ||
      (item.serviceOrderId && vehicleOrderIds.has(item.serviceOrderId)),
  );

  const totalFaturado = vehicleReceivables.reduce((sum, item) => sum + item.value, 0);
  const totalRecebido = vehicleReceivables.reduce(
    (sum, item) => sum + (item.receivedValue ?? 0),
    0,
  );

  const paymentDates = vehicleReceivables
    .map((item) => item.receivedAt)
    .filter((date): date is string => Boolean(date));

  return {
    totalFaturado,
    totalRecebido,
    saldoPendente: totalFaturado - totalRecebido,
    lastPaymentAt: latestDate(paymentDates),
  };
}

/**
 * Regras de exclusão (Fase 2C, item 7): exclusão definitiva só é permitida quando o
 * cliente não possui orçamento aprovado, ordem de serviço ou lançamento financeiro
 * vinculado. Caso contrário, apenas "Inativar Cliente" é permitido.
 */
export function canDeleteClient(
  clientId: string,
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
  receivables: Receivable[],
): boolean {
  const hasApprovedQuote = quotes.some(
    (quote) => quote.clientId === clientId && quote.status === "aprovado",
  );
  const hasServiceOrder = serviceOrders.some((order) => order.clientId === clientId);
  const hasFinancial = receivables.some((item) => item.clientId === clientId);
  return !hasApprovedQuote && !hasServiceOrder && !hasFinancial;
}

/** Exclusão de veículo só é permitida quando não há vistoria, orçamento ou OS vinculados. */
export function canDeleteVehicle(
  vehicleId: string,
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
  inspections: Inspection[],
): boolean {
  const hasQuote = quotes.some((quote) => quote.vehicleId === vehicleId);
  const hasServiceOrder = serviceOrders.some((order) => order.vehicleId === vehicleId);
  const hasInspection = inspections.some((inspection) => inspection.vehicleId === vehicleId);
  return !hasQuote && !hasServiceOrder && !hasInspection;
}
