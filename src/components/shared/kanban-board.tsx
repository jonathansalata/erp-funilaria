import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { StatusBadge, type statusBadgeVariants } from "@/components/shared/status-badge";
import type { VariantProps } from "class-variance-authority";

type StatusVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

export type KanbanColumnData<T> = {
  id: string;
  title: string;
  /** Cor semântica da coluna, equivalente a `config_categories.color` (Fase 1+). */
  variant?: StatusVariant;
  items: T[];
};

type KanbanBoardProps<T> = {
  columns: KanbanColumnData<T>[];
  getItemId: (item: T) => string;
  renderCard: (item: T) => ReactNode;
};

/**
 * Board Kanban genérico — usado nas Pipelines de Orçamentos e Ordens de Serviço (visual,
 * dados mockados na Fase 0.5). Drag & drop e persistência de `status_id` ficam para as fases
 * com integração real (ver ARCHITECTURE.md, seção 4.6.2).
 */
export function KanbanBoard<T>({ columns, getItemId, renderCard }: KanbanBoardProps<T>) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((column) => (
        <div
          key={column.id}
          className="bg-muted/40 flex w-72 shrink-0 flex-col gap-3 rounded-xl p-3"
        >
          <div className="flex items-center justify-between gap-2 px-1">
            <StatusBadge variant={column.variant} dot>
              {column.title}
            </StatusBadge>
            <span className="text-muted-foreground text-xs font-medium">{column.items.length}</span>
          </div>

          <div className="flex flex-col gap-2">
            {column.items.length === 0 ? (
              <div className="text-muted-foreground border-border rounded-lg border border-dashed px-3 py-6 text-center text-xs">
                Nenhum item
              </div>
            ) : (
              column.items.map((item) => <div key={getItemId(item)}>{renderCard(item)}</div>)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border-border flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-xs transition-shadow hover:shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
