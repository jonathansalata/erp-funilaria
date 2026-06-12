"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DamagePoint } from "@/lib/mock-data/inspections";

type DamageMapProps = {
  damagePoints: DamagePoint[];
  onChange?: (damagePoints: DamagePoint[]) => void;
  readOnly?: boolean;
  className?: string;
};

const SEVERITY_META: Record<DamagePoint["severity"], { label: string; color: string }> = {
  leve: { label: "Leve", color: "bg-info border-info" },
  moderado: { label: "Moderado", color: "bg-warning border-warning" },
  grave: { label: "Grave", color: "bg-destructive border-destructive" },
};

const VIEW_LABELS: Record<DamagePoint["view"], string> = {
  frente: "Frente",
  traseira: "Traseira",
  lateral_esquerda: "Lateral esquerda",
  lateral_direita: "Lateral direita",
  topo: "Topo",
};

export function DamageMap({ damagePoints, onChange, readOnly = false, className }: DamageMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const editable = !readOnly && !!onChange;

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!editable || !onChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);

    const newPoint: DamagePoint = {
      id: `dmg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
      severity: "leve",
      description: "",
      view: "topo",
    };

    onChange([...damagePoints, newPoint]);
    setSelectedId(newPoint.id);
  }

  function updatePoint(id: string, patch: Partial<DamagePoint>) {
    onChange?.(damagePoints.map((point) => (point.id === id ? { ...point, ...patch } : point)));
  }

  function removePoint(id: string) {
    onChange?.(damagePoints.filter((point) => point.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        onClick={handleMapClick}
        className={cn(
          "bg-muted/30 relative aspect-[4/3] w-full overflow-hidden rounded-lg border",
          editable && "cursor-crosshair",
        )}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <rect
            x="20"
            y="5"
            width="60"
            height="90"
            rx="14"
            className="fill-card stroke-border"
            strokeWidth="1.5"
          />
          <rect
            x="28"
            y="14"
            width="44"
            height="18"
            rx="3"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <rect
            x="28"
            y="68"
            width="44"
            height="18"
            rx="3"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <rect
            x="14"
            y="22"
            width="6"
            height="16"
            rx="2"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <rect
            x="80"
            y="22"
            width="6"
            height="16"
            rx="2"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <rect
            x="14"
            y="62"
            width="6"
            height="16"
            rx="2"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <rect
            x="80"
            y="62"
            width="6"
            height="16"
            rx="2"
            className="fill-muted stroke-border"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        </svg>

        {damagePoints.map((point) => (
          <button
            key={point.id}
            type="button"
            title={point.description || VIEW_LABELS[point.view]}
            onClick={(event) => {
              event.stopPropagation();
              setSelectedId((current) => (current === point.id ? null : point.id));
            }}
            className={cn(
              "absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm transition-transform",
              SEVERITY_META[point.severity].color,
              selectedId === point.id && "ring-foreground/40 scale-125 ring-2",
            )}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {Object.entries(SEVERITY_META).map(([severity, meta]) => (
          <div key={severity} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full border-2", meta.color)} />
            <span className="text-muted-foreground">{meta.label}</span>
          </div>
        ))}
        {editable && (
          <span className="text-muted-foreground">Clique no mapa para adicionar uma avaria.</span>
        )}
      </div>

      {damagePoints.length > 0 && (
        <div className="flex flex-col gap-2">
          {damagePoints.map((point) => (
            <div
              key={point.id}
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                selectedId === point.id && "border-foreground/30 bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full border-2",
                  SEVERITY_META[point.severity].color,
                )}
              />
              {editable ? (
                <>
                  <Select
                    value={point.severity}
                    onValueChange={(value) =>
                      value && updatePoint(point.id, { severity: value as DamagePoint["severity"] })
                    }
                  >
                    <SelectTrigger size="sm" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEVERITY_META).map(([value, meta]) => (
                        <SelectItem key={value} value={value}>
                          {meta.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={point.view}
                    onValueChange={(value) =>
                      value && updatePoint(point.id, { view: value as DamagePoint["view"] })
                    }
                  >
                    <SelectTrigger size="sm" className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VIEW_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="min-w-48 flex-1"
                    placeholder="Descrição da avaria"
                    value={point.description}
                    onChange={(event) => updatePoint(point.id, { description: event.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removePoint(point.id)}
                    aria-label="Remover avaria"
                  >
                    <Trash2 />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col">
                  <span className="font-medium">{point.description}</span>
                  <span className="text-muted-foreground text-xs">
                    {VIEW_LABELS[point.view]} · {SEVERITY_META[point.severity].label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
