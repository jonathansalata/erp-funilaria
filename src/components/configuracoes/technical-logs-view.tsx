"use client";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TECHNICAL_LOG_LEVEL_LABELS,
  TECHNICAL_LOG_LEVEL_VARIANTS,
  type TechnicalLog,
  type TechnicalLogLevel,
} from "@/lib/mock-data/settings";
import { formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

export function TechnicalLogsView() {
  const technicalLogs = useErpDataStore((state) => state.technicalLogs);

  const sortedLogs = [...technicalLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const moduleOptions = Array.from(new Set(technicalLogs.map((log) => log.module))).map(
    (module) => ({ label: module, value: module }),
  );
  const userOptions = Array.from(new Set(technicalLogs.map((log) => log.user))).map((user) => ({
    label: user,
    value: user,
  }));

  const columns: DataTableColumn<TechnicalLog>[] = [
    {
      id: "timestamp",
      header: "Data/Hora",
      cell: (log) => formatDateTime(log.timestamp),
      sortValue: (log) => log.timestamp,
      className: "whitespace-nowrap",
    },
    {
      id: "level",
      header: "Tipo",
      cell: (log) => (
        <StatusBadge variant={TECHNICAL_LOG_LEVEL_VARIANTS[log.level]}>
          {TECHNICAL_LOG_LEVEL_LABELS[log.level]}
        </StatusBadge>
      ),
      sortValue: (log) => TECHNICAL_LOG_LEVEL_LABELS[log.level],
    },
    {
      id: "module",
      header: "Módulo",
      cell: (log) => log.module,
      sortValue: (log) => log.module,
      className: "whitespace-nowrap",
    },
    {
      id: "user",
      header: "Usuário",
      cell: (log) => log.user,
      sortValue: (log) => log.user,
      className: "whitespace-nowrap",
    },
    {
      id: "message",
      header: "Mensagem",
      cell: (log) => <span className="text-muted-foreground">{log.message}</span>,
    },
  ];

  const filters: DataTableFilter<TechnicalLog>[] = [
    {
      id: "level",
      label: "Tipo",
      options: Object.entries(TECHNICAL_LOG_LEVEL_LABELS).map(([value, label]) => ({
        label,
        value,
      })),
      predicate: (log, value) => log.level === (value as TechnicalLogLevel),
    },
    {
      id: "module",
      label: "Módulo",
      options: moduleOptions,
      predicate: (log, value) => log.module === value,
    },
    {
      id: "user",
      label: "Usuário",
      options: userOptions,
      predicate: (log, value) => log.user === value,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs Técnicos</CardTitle>
        <CardDescription>
          Erros, avisos, exceções e falhas de validação registrados pelo sistema, com filtros por
          data, usuário e módulo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={sortedLogs}
          columns={columns}
          getRowId={(log) => log.id}
          searchPlaceholder="Buscar por mensagem, módulo ou usuário..."
          searchFn={(log, query) =>
            log.message.toLowerCase().includes(query) ||
            log.module.toLowerCase().includes(query) ||
            log.user.toLowerCase().includes(query)
          }
          filters={filters}
          emptyMessage="Nenhum log registrado."
        />
      </CardContent>
    </Card>
  );
}
