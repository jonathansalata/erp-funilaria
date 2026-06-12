"use client";

import { useMemo, useState } from "react";

import { ReportTable, type ReportColumn } from "@/components/relatorios/report-table";
import type { DataTableFilter } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ENTITY_TYPE_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_VARIANTS,
  type EntityEvent,
  type EntityEventType,
  type EntityType,
} from "@/lib/mock-data/entity-events";
import { formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

const ENTITY_TYPE_TO_MODULE: Record<EntityType, string> = {
  client: "Clientes",
  vehicle: "Veículos",
  quote: "Orçamentos",
  service_order: "Ordens de Serviço",
  inspection: "Vistorias",
  receivable: "Financeiro",
  payable: "Financeiro",
  auth: "Autenticação",
  user: "Usuários",
  settings: "Configurações",
};

const MODULE_OPTIONS = Array.from(new Set(Object.values(ENTITY_TYPE_TO_MODULE))).map((label) => ({
  label,
  value: label,
}));

export default function AuditoriaPage() {
  const events = useErpDataStore((state) => state.events);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const userOptions = useMemo(() => {
    const names = new Set<string>();
    for (const event of events) names.add(event.createdBy ?? "Sistema");
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ label: name, value: name }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = event.createdAt.slice(0, 10);
      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
      return true;
    });
  }, [events, startDate, endDate]);

  const sortedEvents = useMemo(
    () =>
      [...filteredEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [filteredEvents],
  );

  const columns: ReportColumn<EntityEvent>[] = [
    {
      id: "createdAt",
      header: "Data/Hora",
      cell: (event) => formatDateTime(event.createdAt),
      sortValue: (event) => event.createdAt,
      className: "whitespace-nowrap",
      csvHeader: "Data/Hora",
      csvValue: (event) => formatDateTime(event.createdAt),
    },
    {
      id: "createdBy",
      header: "Usuário",
      cell: (event) => event.createdBy ?? "Sistema",
      sortValue: (event) => event.createdBy ?? "Sistema",
      className: "whitespace-nowrap",
      csvHeader: "Usuário",
      csvValue: (event) => event.createdBy ?? "Sistema",
    },
    {
      id: "module",
      header: "Módulo",
      cell: (event) => ENTITY_TYPE_TO_MODULE[event.entityType],
      sortValue: (event) => ENTITY_TYPE_TO_MODULE[event.entityType],
      className: "whitespace-nowrap",
      csvHeader: "Módulo",
      csvValue: (event) => ENTITY_TYPE_TO_MODULE[event.entityType],
    },
    {
      id: "entityType",
      header: "Entidade",
      cell: (event) => ENTITY_TYPE_LABELS[event.entityType],
      sortValue: (event) => ENTITY_TYPE_LABELS[event.entityType],
      className: "whitespace-nowrap",
      csvHeader: "Entidade",
      csvValue: (event) => ENTITY_TYPE_LABELS[event.entityType],
    },
    {
      id: "eventType",
      header: "Tipo",
      cell: (event) => (
        <StatusBadge variant={EVENT_VARIANTS[event.eventType]}>
          {EVENT_TYPE_LABELS[event.eventType]}
        </StatusBadge>
      ),
      sortValue: (event) => EVENT_TYPE_LABELS[event.eventType],
      csvHeader: "Tipo",
      csvValue: (event) => EVENT_TYPE_LABELS[event.eventType],
    },
    {
      id: "title",
      header: "Título",
      cell: (event) => <span className="font-medium">{event.title}</span>,
      sortValue: (event) => event.title,
      csvHeader: "Título",
      csvValue: (event) => event.title,
    },
    {
      id: "description",
      header: "Detalhes (valor anterior → valor novo)",
      cell: (event) => <span className="text-muted-foreground">{event.description ?? "-"}</span>,
      csvHeader: "Detalhes",
      csvValue: (event) => event.description ?? "-",
    },
    {
      id: "ip",
      header: "IP",
      cell: (event) => (event.metadata?.ip as string | undefined) ?? "-",
      csvHeader: "IP",
      csvValue: (event) => (event.metadata?.ip as string | undefined) ?? "-",
      className: "whitespace-nowrap",
    },
  ];

  const filters: DataTableFilter<EntityEvent>[] = [
    {
      id: "createdBy",
      label: "Usuário",
      options: userOptions,
      predicate: (event, value) => (event.createdBy ?? "Sistema") === value,
    },
    {
      id: "module",
      label: "Módulo",
      options: MODULE_OPTIONS,
      predicate: (event, value) => ENTITY_TYPE_TO_MODULE[event.entityType] === value,
    },
    {
      id: "entityType",
      label: "Entidade",
      options: Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (event, value) => event.entityType === (value as EntityType),
    },
    {
      id: "eventType",
      label: "Tipo",
      options: Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (event, value) => event.eventType === (value as EntityEventType),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Auditoria</h1>
        <p className="text-muted-foreground text-sm">
          Histórico de ações realizadas pelos usuários no sistema: logins, cadastros, edições,
          inativações e exclusões — com registro de valor anterior e valor novo.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-start-date">Data inicial</Label>
          <Input
            id="audit-start-date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="audit-end-date">Data final</Label>
          <Input
            id="audit-end-date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <ReportTable
        title="Eventos de auditoria"
        description="Registros de login, alterações e ações administrativas, com filtros por usuário, módulo, data e tipo."
        data={sortedEvents}
        columns={columns}
        getRowId={(event) => event.id}
        searchPlaceholder="Buscar por título, descrição ou usuário..."
        searchFn={(event, query) =>
          event.title.toLowerCase().includes(query) ||
          (event.description?.toLowerCase().includes(query) ?? false) ||
          (event.createdBy?.toLowerCase().includes(query) ?? false)
        }
        filters={filters}
        filename="auditoria"
      />
    </div>
  );
}
