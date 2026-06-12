"use client";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { DocumentActions } from "@/components/shared/document-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addPdfTable,
  createPdfDocument,
  downloadPdf,
  printPdf,
  type PdfTableColumn,
} from "@/lib/pdf/pdf-utils";
import { downloadCsv } from "@/lib/utils";

export type ReportColumn<T> = DataTableColumn<T> & {
  csvHeader: string;
  csvValue: (row: T) => string | number;
};

type ReportTableProps<T> = {
  title: string;
  description: string;
  data: T[];
  columns: ReportColumn<T>[];
  getRowId: (row: T) => string;
  filters?: DataTableFilter<T>[];
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filename: string;
  /** Substitui as colunas do PDF geradas automaticamente (ex.: para aplicar colorização). */
  pdfColumns?: PdfTableColumn<T>[];
  pdfOrientation?: "portrait" | "landscape";
};

export function ReportTable<T>({
  title,
  description,
  data,
  columns,
  getRowId,
  filters,
  searchPlaceholder,
  searchFn,
  filename,
  pdfColumns,
  pdfOrientation,
}: ReportTableProps<T>) {
  const csvFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  const pdfFilename = filename.replace(/\.csv$/, ".pdf");

  const resolvedPdfColumns: PdfTableColumn<T>[] =
    pdfColumns ??
    columns.map((column) => ({
      header: column.csvHeader,
      value: (row: T) => String(column.csvValue(row)),
      align: column.className?.includes("text-right") ? "right" : undefined,
    }));

  function buildPdfDocument() {
    const { doc, contentStartY } = createPdfDocument({
      title,
      subtitle: description,
      orientation: pdfOrientation ?? "landscape",
    });
    addPdfTable(doc, contentStartY, data, resolvedPdfColumns);
    return doc;
  }

  function handleExportPdf() {
    downloadPdf(buildPdfDocument(), pdfFilename);
  }

  function handlePrint() {
    printPdf(buildPdfDocument());
  }

  function handleExportCsv() {
    const headers = columns.map((column) => column.csvHeader);
    const rows = data.map((row) => columns.map((column) => column.csvValue(row)));
    downloadCsv(csvFilename, headers, rows);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <DocumentActions
          onExportPdf={handleExportPdf}
          onExportCsv={handleExportCsv}
          onPrint={handlePrint}
        />
      </CardHeader>
      <CardContent>
        <DataTable
          data={data}
          columns={columns}
          getRowId={getRowId}
          filters={filters}
          searchPlaceholder={searchPlaceholder}
          searchFn={searchFn}
          emptyMessage="Nenhum registro encontrado."
        />
      </CardContent>
    </Card>
  );
}
