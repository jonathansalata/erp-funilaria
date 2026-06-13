import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { StatusVariant } from "@/components/shared/status-badge";

export type TimelineEntry = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  variant?: StatusVariant;
  author?: string;
  actions?: ReactNode;
};

type TimelineProps = {
  entries: TimelineEntry[];
  emptyMessage?: string;
};

const DOT_VARIANT_CLASSES: Record<StatusVariant, string> = {
  default: "bg-muted-foreground/60 text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  destructive: "bg-destructive/15 text-destructive",
};

export function Timeline({
  entries,
  emptyMessage = "Nenhuma atividade registrada.",
}: TimelineProps) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const Icon = entry.icon ?? Circle;
        const variant = entry.variant ?? "default";

        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  DOT_VARIANT_CLASSES[variant],
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {index < entries.length - 1 && <span className="bg-border w-px flex-1" />}
            </div>
            <div
              className={cn(
                "flex flex-1 flex-col gap-0.5 pb-4",
                index === entries.length - 1 && "pb-0",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.actions}
              </div>
              {entry.description && (
                <p className="text-muted-foreground text-sm">{entry.description}</p>
              )}
              <p className="text-muted-foreground text-xs">
                {formatDateTime(entry.timestamp)}
                {entry.author ? ` · ${entry.author}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
