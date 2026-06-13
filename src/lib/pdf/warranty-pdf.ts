import type { jsPDF } from "jspdf";

import type { Client } from "@/lib/mock-data/clients";
import {
  calculateServiceOrderTotal,
  getWarrantyEndDate,
  type ServiceOrder,
  type ServiceOrderItem,
} from "@/lib/mock-data/service-orders-data";
import type { Vehicle } from "@/lib/mock-data/vehicles";
import { getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  addPdfKeyValueSection,
  addPdfTable,
  createPdfDocument,
  PDF_COLORS,
} from "@/lib/pdf/pdf-utils";

const WARRANTY_ITEM_COLUMNS = [
  { header: "Serviço executado", value: (row: ServiceOrderItem) => row.description },
  { header: "Categoria", value: (row: ServiceOrderItem) => row.category },
  {
    header: "Subtotal",
    value: (row: ServiceOrderItem) => formatCurrency(row.quantity * row.unitPrice),
    align: "right" as const,
  },
];

const MARGIN = 40;

/** Monta o Termo de Garantia e Entrega de uma ordem de serviço (Fase 2B.8.3 — Bloco 21). */
export function buildWarrantyPdf(order: ServiceOrder, client?: Client, vehicle?: Vehicle) {
  const { doc, contentStartY } = createPdfDocument({
    title: "Termo de Garantia e Entrega",
    subtitle: order.code,
  });

  const total = calculateServiceOrderTotal(order.items);
  const warrantyEndDate =
    order.deliveredAt && order.warrantyPeriod !== undefined
      ? getWarrantyEndDate(order.deliveredAt, order.warrantyPeriod)
      : undefined;

  let y = addPdfKeyValueSection(doc, contentStartY, "Cliente", [
    { label: "Nome", value: client?.name ?? "—" },
    { label: "Documento", value: client?.document ?? "—" },
  ]);

  y = addPdfKeyValueSection(doc, y + 10, "Veículo", [
    { label: "Veículo", value: vehicle ? getVehicleLabel(vehicle) : "—" },
    { label: "Placa", value: vehicle?.plate ?? "—" },
    {
      label: "Quilometragem na entrega",
      value:
        order.deliveryMileage !== undefined
          ? `${order.deliveryMileage.toLocaleString("pt-BR")} km`
          : "—",
    },
  ]);

  y = addPdfTable(doc, y + 10, order.items, WARRANTY_ITEM_COLUMNS);

  y = addPdfKeyValueSection(doc, y + 20, "Totais", [
    { label: "Valor total dos serviços", value: formatCurrency(total) },
  ]);

  y = addPdfKeyValueSection(doc, y + 20, "Garantia e Entrega", [
    {
      label: "Data da entrega",
      value: order.deliveredAt ? formatDate(order.deliveredAt) : "—",
    },
    {
      label: "Prazo de garantia",
      value: order.warrantyPeriod !== undefined ? `${order.warrantyPeriod} dias` : "—",
    },
    {
      label: "Garantia válida até",
      value: warrantyEndDate ? formatDate(warrantyEndDate) : "—",
    },
  ]);

  drawSignatureLines(doc, y + 60);

  return doc;
}

function drawSignatureLines(doc: jsPDF, y: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const lineWidth = (pageWidth - MARGIN * 2 - 40) / 2;

  doc.setDrawColor(...PDF_COLORS.secondary);
  doc.setLineWidth(0.5);

  doc.line(MARGIN, y, MARGIN + lineWidth, y);
  doc.line(pageWidth - MARGIN - lineWidth, y, pageWidth - MARGIN, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text("Assinatura do cliente", MARGIN, y + 16);
  doc.text("Assinatura da oficina", pageWidth - MARGIN - lineWidth, y + 16);
}
