import type { KanbanColumnData } from "@/components/shared/kanban-board";
import type { StatusVariant } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import type { Quote } from "@/lib/mock-data/quotes-data";
import type { ServiceOrder, ServiceOrderStatus } from "@/lib/mock-data/service-orders-data";
import { getTechnicianById } from "@/lib/mock-data/technicians";
import { getVehicleLabelById } from "@/lib/mock-data/vehicles";
import { formatDate } from "@/lib/utils";

/**
 * Pipeline de Ordens de Serviço derivada de `service-orders-data.ts` + `clients.ts` +
 * `vehicles.ts` + `technicians.ts`. Mantém o shape `KanbanColumnData<ServiceOrderCard>[]`
 * consumido pelas telas de Ordens de Serviço.
 */
export type ServiceOrderCard = {
  id: string;
  code: string;
  client: string;
  vehicle: string;
  technician: string;
  dueDate: string;
  quoteId?: string;
  quoteCode?: string;
};

export const SERVICE_ORDER_STATUS_META: Record<
  ServiceOrderStatus,
  { title: string; variant: StatusVariant }
> = {
  aguardando_inicio: { title: "Aguardando início", variant: "default" },
  em_execucao: { title: "Em execução", variant: "info" },
  aguardando_peca: { title: "Aguardando peça", variant: "warning" },
  finalizado: { title: "Finalizado", variant: "success" },
  entregue: { title: "Entregue", variant: "primary" },
  cancelado: { title: "Cancelado", variant: "destructive" },
};

const SERVICE_ORDER_STATUS_ORDER: ServiceOrderStatus[] = [
  "aguardando_inicio",
  "em_execucao",
  "aguardando_peca",
  "finalizado",
  "entregue",
  "cancelado",
];

/** Monta as colunas da Pipeline de Ordens de Serviço a partir de uma lista de OS. */
export function buildServiceOrderPipelineColumns(
  orders: ServiceOrder[],
  quotes: Quote[],
): KanbanColumnData<ServiceOrderCard>[] {
  return SERVICE_ORDER_STATUS_ORDER.map((status) => {
    const meta = SERVICE_ORDER_STATUS_META[status];
    const items = orders
      .filter((order) => order.status === status)
      .map((order) => {
        const originQuote = order.quoteId
          ? quotes.find((quote) => quote.id === order.quoteId)
          : undefined;

        return {
          id: order.id,
          code: order.code,
          client: getClientById(order.clientId)?.name ?? "Cliente não encontrado",
          vehicle: getVehicleLabelById(order.vehicleId),
          technician: getTechnicianById(order.technicianId)?.name ?? "Não atribuído",
          dueDate: formatDate(order.dueDate),
          quoteId: originQuote?.id,
          quoteCode: originQuote?.code,
        };
      });

    return {
      id: status,
      title: meta.title,
      variant: meta.variant,
      items,
    };
  });
}
