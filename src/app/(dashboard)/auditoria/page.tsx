"use client";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
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

export default function AuditoriaPage() {
  const events = useErpDataStore((state) => state.events);

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const columns: DataTableColumn<EntityEvent>[] = [
    {
      id: "createdAt",
      header: "Data/Hora",
      cell: (event) => formatDateTime(event.createdAt),
      sortValue: (event) => event.createdAt,
      className: "whitespace-nowrap",
    },
    {
      id: "createdBy",
      header: "Usuário",
      cell: (event) => event.createdBy ?? "Sistema",
      sortValue: (event) => event.createdBy ?? "Sistema",
      className: "whitespace-nowrap",
    },
    {
      id: "entityType",
      header: "Entidade",
      cell: (event) => ENTITY_TYPE_LABELS[event.entityType],
      sortValue: (event) => ENTITY_TYPE_LABELS[event.entityType],
      className: "whitespace-nowrap",
    },
    {
      id: "eventType",
      header: "Ação",
      cell: (event) => (
        <StatusBadge variant={EVENT_VARIANTS[event.eventType]}>
          {EVENT_TYPE_LABELS[event.eventType]}
        </StatusBadge>
      ),
      sortValue: (event) => EVENT_TYPE_LABELS[event.eventType],
    },
    {
      id: "title",
      header: "Título",
      cell: (event) => <span className="font-medium">{event.title}</span>,
      sortValue: (event) => event.title,
    },
    {
      id: "description",
      header: "Detalhes (valor anterior → valor novo)",
      cell: (event) => <span className="text-muted-foreground">{event.description ?? "-"}</span>,
    },
  ];

  const filters: DataTableFilter<EntityEvent>[] = [
    {
      id: "entityType",
      label: "Entidade",
      options: Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (event, value) => event.entityType === (value as EntityType),
    },
    {
      id: "eventType",
      label: "Ação",
      options: Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (event, value) => event.eventType === (value as EntityEventType),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Auditoria</h1>
        <p className="text-muted-foreground text-sm">
          Histórico de ações realizadas pelos usuários no sistema: cadastros, edições, inativações e
          exclusões.
        </p>
      </div>

      <DataTable
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
        emptyMessage="Nenhum evento registrado."
        pageSize={20}
      />
    </div>
  );
}
