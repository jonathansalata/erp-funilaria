"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentActions } from "@/components/shared/document-actions";
import { getDreSummary } from "@/lib/mock-data/financeiro";
import {
  addPdfKeyValueSection,
  createPdfDocument,
  downloadPdf,
  printPdf,
} from "@/lib/pdf/pdf-utils";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { formatCurrency } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

const MONTHS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const YEARS = ["2025", "2026", "2027"];

export function DreView() {
  const receivables = useErpDataStore((state) => state.receivables);
  const payables = useErpDataStore((state) => state.payables);

  const [year, setYear] = useState(REFERENCE_DATE.slice(0, 4));
  const [month, setMonth] = useState(REFERENCE_DATE.slice(5, 7));

  const dre = getDreSummary(receivables, payables, `${year}-${month}`);

  const rows: { label: string; value: number; emphasis?: boolean }[] = [
    { label: "Receita bruta", value: dre.receitaBruta },
    { label: "(–) Custos", value: -dre.custos },
    { label: "Resultado operacional", value: dre.resultadoOperacional, emphasis: true },
    { label: "(–) Despesas", value: -dre.despesas },
    { label: "Lucro líquido", value: dre.lucro, emphasis: true },
  ];

  const periodLabel = `${MONTHS.find((item) => item.value === month)?.label} de ${year}`;

  function buildPdfDocument() {
    const { doc, contentStartY } = createPdfDocument({
      title: "DRE Gerencial",
      subtitle: `Período: ${periodLabel}`,
    });
    addPdfKeyValueSection(
      doc,
      contentStartY,
      `Resultado de ${periodLabel}`,
      rows.map((row) => ({ label: row.label, value: formatCurrency(row.value) })),
    );
    return doc;
  }

  function handleExportPdf() {
    downloadPdf(buildPdfDocument(), "dre.pdf");
  }

  function handlePrint() {
    printPdf(buildPdfDocument());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">DRE Gerencial</h1>
          <p className="text-muted-foreground text-sm">
            Demonstrativo de resultado simplificado por período.
          </p>
        </div>
        <DocumentActions onExportPdf={handleExportPdf} onPrint={handlePrint} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Mês</span>
          <Select value={month} onValueChange={(value) => value && setMonth(value as string)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Ano</span>
          <Select value={year} onValueChange={(value) => value && setYear(value as string)}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>
            Resultado de {MONTHS.find((item) => item.value === month)?.label} de {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className={
                row.emphasis
                  ? "font-heading flex items-center justify-between border-t py-2 text-base font-semibold"
                  : "flex items-center justify-between py-2 text-sm"
              }
            >
              <span className={row.emphasis ? "" : "text-muted-foreground"}>{row.label}</span>
              <span className={row.value < 0 ? "text-destructive" : ""}>
                {formatCurrency(row.value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
