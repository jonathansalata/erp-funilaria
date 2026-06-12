import type { Client } from "@/lib/mock-data/clients";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import {
  calculateServiceOrderTotal,
  type ServiceOrder,
  type ServiceOrderItem,
} from "@/lib/mock-data/service-orders-data";
import type { Vehicle } from "@/lib/mock-data/vehicles";
import { getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { addPdfKeyValueSection, addPdfTable, createPdfDocument } from "@/lib/pdf/pdf-utils";

const SERVICE_ORDER_ITEM_COLUMNS = [
  { header: "Descrição", value: (row: ServiceOrderItem) => row.description },
  { header: "Categoria", value: (row: ServiceOrderItem) => row.category },
  {
    header: "Qtd.",
    value: (row: ServiceOrderItem) => String(row.quantity),
    align: "right" as const,
  },
  {
    header: "Valor unit.",
    value: (row: ServiceOrderItem) => formatCurrency(row.unitPrice),
    align: "right" as const,
  },
  {
    header: "Subtotal",
    value: (row: ServiceOrderItem) => formatCurrency(row.quantity * row.unitPrice),
    align: "right" as const,
  },
];

/** Monta o documento PDF de uma ordem de serviço (Fase 2B.5 — Bloco 04). */
export function buildServiceOrderPdf(order: ServiceOrder, client?: Client, vehicle?: Vehicle) {
  const { doc, contentStartY } = createPdfDocument({
    title: "Ordem de Serviço",
    subtitle: order.code,
  });

  const total = calculateServiceOrderTotal(order.items);

  let y = addPdfKeyValueSection(doc, contentStartY, "Dados da ordem de serviço", [
    { label: "Código", value: order.code },
    { label: "Status", value: SERVICE_ORDER_STATUS_META[order.status].title },
    { label: "Cliente", value: client?.name ?? "—" },
    { label: "Veículo", value: vehicle ? getVehicleLabel(vehicle) : "—" },
    { label: "Criada em", value: formatDateTime(order.createdAt) },
    { label: "Previsão de entrega", value: formatDate(order.dueDate) },
  ]);

  y = addPdfTable(doc, y + 10, order.items, SERVICE_ORDER_ITEM_COLUMNS);

  y = addPdfKeyValueSection(doc, y + 20, "Totais", [
    { label: "Total", value: formatCurrency(total) },
  ]);

  if (order.notes) {
    addPdfKeyValueSection(doc, y + 20, "Observações", [{ label: "Notas", value: order.notes }]);
  }

  return doc;
}
