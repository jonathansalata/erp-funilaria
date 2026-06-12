"use client";

import { Download, FileText, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

type DocumentActionsProps = {
  onExportPdf: () => void;
  onExportCsv?: () => void;
  onPrint: () => void;
};

/** Botões padrão "Exportar PDF / Exportar CSV / Imprimir" (Fase 2D — diretriz global de PDF e impressão). */
export function DocumentActions({ onExportPdf, onExportCsv, onPrint }: DocumentActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={onExportPdf}>
        <FileText />
        Exportar PDF
      </Button>
      {onExportCsv && (
        <Button variant="outline" size="sm" onClick={onExportCsv}>
          <Download />
          Exportar CSV
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onPrint}>
        <Printer />
        Imprimir
      </Button>
    </div>
  );
}
