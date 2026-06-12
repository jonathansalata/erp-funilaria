"use client";

import { Download } from "lucide-react";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
}: ReportTableProps<T>) {
  function handleExport() {
    const headers = columns.map((column) => column.csvHeader);
    const rows = data.map((row) => columns.map((column) => column.csvValue(row)));
    downloadCsv(filename, headers, rows);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download />
          Exportar CSV
        </Button>
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
