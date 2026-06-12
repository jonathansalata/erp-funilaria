import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";

import { formatDateTime } from "@/lib/utils";

/**
 * Infraestrutura compartilhada de geração de PDF (Fase 2D — diretriz global de PDF e
 * impressão). Aplica a identidade visual do ERP: logo/nome da empresa, data de emissão,
 * número do relatório e paginação em todos os documentos gerados.
 */

export const COMPANY_NAME = "ERP Funilaria";

/** Cores da identidade visual: verde = positivo, vermelho = negativo, amarelo = pendência, cinza = secundário. */
export const PDF_COLORS = {
  positive: [22, 163, 74] as [number, number, number],
  negative: [220, 38, 38] as [number, number, number],
  pending: [202, 138, 4] as [number, number, number],
  secondary: [107, 114, 128] as [number, number, number],
  primary: [30, 41, 59] as [number, number, number],
};

let reportCounter = 0;

/** Gera um número de relatório sequencial baseado na data/hora de emissão. */
export function generateReportNumber(): string {
  reportCounter += 1;
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return `${stamp}-${String(reportCounter).padStart(3, "0")}`;
}

export type PdfDocumentOptions = {
  title: string;
  subtitle?: string;
  orientation?: "portrait" | "landscape";
  reportNumber?: string;
};

const MARGIN = 40;

/** Cria um documento PDF com cabeçalho padrão (logo, nome da empresa, título, data de emissão e número do relatório). */
export function createPdfDocument(options: PdfDocumentOptions): {
  doc: jsPDF;
  reportNumber: string;
  contentStartY: number;
} {
  const doc = new jsPDF({ orientation: options.orientation ?? "portrait", unit: "pt" });
  const reportNumber = options.reportNumber ?? generateReportNumber();

  drawHeader(doc, options.title, options.subtitle, reportNumber);

  return { doc, reportNumber, contentStartY: 110 };
}

function drawHeader(doc: jsPDF, title: string, subtitle: string | undefined, reportNumber: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Logo (badge "EF")
  doc.setFillColor(...PDF_COLORS.primary);
  doc.roundedRect(MARGIN, 28, 28, 28, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("EF", MARGIN + 14, 28 + 18, { align: "center" });

  // Nome da empresa
  doc.setTextColor(...PDF_COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(COMPANY_NAME, MARGIN + 38, 42);

  // Título do relatório
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text(title, MARGIN + 38, 58);

  // Data de emissão e número do relatório (alinhados à direita)
  doc.setFontSize(9);
  doc.text(`Emitido em: ${formatDateTime(new Date().toISOString())}`, pageWidth - MARGIN, 36, {
    align: "right",
  });
  doc.text(`Relatório Nº: ${reportNumber}`, pageWidth - MARGIN, 50, { align: "right" });

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(...PDF_COLORS.primary);
    doc.text(subtitle, pageWidth - MARGIN, 64, { align: "right" });
  }

  // Linha separadora
  doc.setDrawColor(...PDF_COLORS.secondary);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 78, pageWidth - MARGIN, 78);
}

/** Adiciona a paginação ("Página X de Y") no rodapé de todas as páginas do documento. */
export function applyPagination(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(`${COMPANY_NAME} — Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 20, {
      align: "center",
    });
  }
}

export type PdfTableColumn<T> = {
  header: string;
  value: (row: T) => string;
  align?: "left" | "right" | "center";
  colorize?: (row: T) => [number, number, number] | undefined;
};

/** Renderiza uma tabela de dados no documento, reutilizando jspdf-autotable. */
export function addPdfTable<T>(
  doc: jsPDF,
  startY: number,
  data: T[],
  columns: PdfTableColumn<T>[],
): number {
  const body: RowInput[] = data.map((row) => columns.map((column) => column.value(row)));

  autoTable(doc, {
    startY,
    margin: { left: MARGIN, right: MARGIN },
    head: [columns.map((column) => column.header)],
    body,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: PDF_COLORS.primary, textColor: 255 },
    columnStyles: columns.reduce<Record<number, { halign: "left" | "right" | "center" }>>(
      (acc, column, index) => {
        if (column.align) acc[index] = { halign: column.align };
        return acc;
      },
      {},
    ),
    didParseCell: (hookData) => {
      if (hookData.section !== "body") return;
      const column = columns[hookData.column.index];
      const row = data[hookData.row.index];
      const color = column?.colorize?.(row);
      if (color) {
        hookData.cell.styles.textColor = color;
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable?.finalY ?? startY;
}

/** Adiciona uma lista de linhas "rótulo: valor" (ex.: ficha de cliente/veículo). */
export function addPdfKeyValueSection(
  doc: jsPDF,
  startY: number,
  title: string,
  rows: { label: string; value: string }[],
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = startY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(title, MARGIN, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const row of rows) {
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(row.label, MARGIN, y);
    doc.setTextColor(...PDF_COLORS.primary);
    doc.text(row.value || "—", MARGIN + 140, y, { maxWidth: pageWidth - MARGIN * 2 - 140 });
    y += 16;
  }

  return y;
}

/** Finaliza o documento (aplica paginação) e dispara o download do PDF. */
export function downloadPdf(doc: jsPDF, filename: string) {
  applyPagination(doc);
  doc.save(filename);
}

/** Finaliza o documento (aplica paginação) e abre o diálogo de impressão do navegador. */
export function printPdf(doc: jsPDF) {
  applyPagination(doc);
  const blobUrl = doc.output("bloburl");
  const win = window.open(blobUrl.toString(), "_blank");
  if (!win) return;
  win.addEventListener("load", () => {
    win.focus();
    win.print();
  });
}
