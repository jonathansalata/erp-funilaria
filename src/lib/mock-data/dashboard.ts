import type { StatusVariant } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import { INSPECTIONS } from "@/lib/mock-data/inspections";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal, type Quote } from "@/lib/mock-data/quotes-data";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import type { ServiceOrder } from "@/lib/mock-data/service-orders-data";
import {
  getVehicleLabelById,
  JOURNEY_STAGE_META,
  type JourneyStage,
  type Vehicle,
} from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate } from "@/lib/utils";

/**
 * Dados do Dashboard (Operacional + Gerencial) computados a partir das entidades relacionais
 * (QUOTES, SERVICE_ORDERS, VEHICLES, INSPECTIONS). Indicadores financeiros (faturamento, ticket
 * médio, faturamento por categoria) permanecem majoritariamente mockados nesta fase.
 *
 * Os indicadores operacionais que dependem de QUOTES/SERVICE_ORDERS são expostos como funções
 * (`getOperationalKpis`, `getUpcomingDeliveries`, `getRecentQuotes`) para que possam ser
 * recalculados a partir da store reativa (`useErpDataStore`) e permanecerem sincronizados com
 * as telas de Pipeline/Lista/Detalhe.
 */

export type OperationalKpi = {
  title: string;
  value: string;
  description: string;
  href?: string;
};

export function getOperationalKpis(
  quotes: Quote[],
  serviceOrders: ServiceOrder[],
): OperationalKpi[] {
  const osEmExecucao = serviceOrders.filter((order) => order.status === "em_execucao").length;
  const vistoriasPendentes = INSPECTIONS.filter(
    (inspection) => inspection.status === "pendente",
  ).length;
  const orcamentosAguardandoAprovacao = quotes.filter(
    (quote) => quote.status === "enviado" || quote.status === "em_negociacao",
  ).length;
  const entregasPrevistasHoje = serviceOrders.filter(
    (order) => order.dueDate.startsWith(REFERENCE_DATE) && order.status !== "entregue",
  ).length;

  return [
    {
      title: "OS em execução",
      value: String(osEmExecucao),
      description: "no pátio agora",
      href: "/ordens-servico?status=em_execucao",
    },
    {
      title: "Vistorias pendentes",
      value: String(vistoriasPendentes),
      description: "aguardando início",
      href: "/vistorias?status=pendente",
    },
    {
      title: "Orçamentos aguardando aprovação",
      value: String(orcamentosAguardandoAprovacao),
      description: "enviados ao cliente",
      href: "/orcamentos?status=aguardando_aprovacao",
    },
    {
      title: "Entregas previstas hoje",
      value: String(entregasPrevistasHoje),
      description: formatDate(REFERENCE_DATE),
      href: "/ordens-servico?status=entregas_hoje",
    },
  ];
}

export type ManagerialKpi = {
  title: string;
  value: string;
  trend: { value: string; direction: "up" | "down" };
  description: string;
};

export const MANAGERIAL_KPIS: ManagerialKpi[] = [
  {
    title: "Faturamento do mês",
    value: "R$ 84.320,00",
    trend: { value: "+12,4%", direction: "up" },
    description: "vs. mês anterior",
  },
  {
    title: "Ticket médio",
    value: "R$ 2.180,00",
    trend: { value: "+3,1%", direction: "up" },
    description: "vs. mês anterior",
  },
  {
    title: "Taxa de conversão de orçamentos",
    value: "62%",
    trend: { value: "-4 p.p.", direction: "down" },
    description: "vs. mês anterior",
  },
  {
    title: "Contas a receber em atraso",
    value: "R$ 6.540,00",
    trend: { value: "+1,2%", direction: "down" },
    description: "5 títulos vencidos",
  },
];

export type JourneyStageSummary = {
  id: JourneyStage;
  label: string;
  count: number;
  variant: StatusVariant;
};

/** Resumo do Pátio por `vehicle_journey_stage` (ARCHITECTURE.md, seção 7.4.2). */
export function getVehicleJourneySummary(vehicles: Vehicle[]): JourneyStageSummary[] {
  return (Object.keys(JOURNEY_STAGE_META) as JourneyStage[]).map((stage) => ({
    id: stage,
    label: JOURNEY_STAGE_META[stage].label,
    count: vehicles.filter((vehicle) => vehicle.journeyStage === stage).length,
    variant: JOURNEY_STAGE_META[stage].variant,
  }));
}

export type UpcomingDelivery = {
  id: string;
  code: string;
  client: string;
  vehicle: string;
  time: string;
  status: { label: string; variant: StatusVariant };
  quoteId?: string;
  quoteCode?: string;
};

export function getUpcomingDeliveries(
  serviceOrders: ServiceOrder[],
  quotes: Quote[],
): UpcomingDelivery[] {
  return serviceOrders
    .filter((order) => order.status !== "entregue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
    .map((order) => {
      const originQuote = order.quoteId
        ? quotes.find((quote) => quote.id === order.quoteId)
        : undefined;

      return {
        id: order.id,
        code: order.code,
        client: getClientById(order.clientId)?.name ?? "Cliente não encontrado",
        vehicle: getVehicleLabelById(order.vehicleId),
        time: `Previsão: ${formatDate(order.dueDate)}`,
        status: {
          label: SERVICE_ORDER_STATUS_META[order.status].title,
          variant: SERVICE_ORDER_STATUS_META[order.status].variant,
        },
        quoteId: originQuote?.id,
        quoteCode: originQuote?.code,
      };
    });
}

export type RecentQuote = {
  id: string;
  code: string;
  client: string;
  vehicle: string;
  value: string;
  status: { label: string; variant: StatusVariant };
};

export function getRecentQuotes(quotes: Quote[]): RecentQuote[] {
  return [...quotes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)
    .map((quote) => ({
      id: quote.id,
      code: quote.code,
      client: getClientById(quote.clientId)?.name ?? "Cliente não encontrado",
      vehicle: getVehicleLabelById(quote.vehicleId),
      value: formatCurrency(calculateQuoteTotal(quote.items).total),
      status: {
        label: QUOTE_STATUS_META[quote.status].title,
        variant: QUOTE_STATUS_META[quote.status].variant,
      },
    }));
}

export type RevenueByCategory = {
  category: string;
  value: number;
  percentage: number;
};

export const REVENUE_BY_CATEGORY: RevenueByCategory[] = [
  { category: "Funilaria", value: 38500, percentage: 46 },
  { category: "Pintura", value: 27200, percentage: 32 },
  { category: "Estética automotiva", value: 12100, percentage: 14 },
  { category: "Peças e acessórios", value: 6520, percentage: 8 },
];
