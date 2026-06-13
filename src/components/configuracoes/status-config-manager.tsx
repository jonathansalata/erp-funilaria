"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { StatusConfig } from "@/lib/mock-data/settings";

type StatusConfigManagerProps = {
  title: string;
  description: string;
  configs: StatusConfig[];
  onUpdate: (key: string, input: Partial<Pick<StatusConfig, "label" | "active">>) => void;
};

export function StatusConfigManager({
  title,
  description,
  configs,
  onUpdate,
}: StatusConfigManagerProps) {
  const [editingKey, setEditingKey] = useState<string | undefined>(undefined);
  const [editingLabel, setEditingLabel] = useState("");

  function startEdit(config: StatusConfig) {
    setEditingKey(config.key);
    setEditingLabel(config.label);
  }

  function saveEdit() {
    const label = editingLabel.trim();
    if (editingKey && label) onUpdate(editingKey, { label });
    setEditingKey(undefined);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {configs.map((config) => (
          <div key={config.key} className="flex flex-wrap items-center gap-2 py-2">
            <StatusBadge variant={config.variant} className="w-fit shrink-0">
              {config.label}
            </StatusBadge>
            {editingKey === config.key ? (
              <>
                <Input
                  value={editingLabel}
                  onChange={(event) => setEditingLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveEdit();
                    if (event.key === "Escape") setEditingKey(undefined);
                  }}
                  autoFocus
                  className="min-w-0 flex-1 basis-full sm:basis-auto"
                />
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={saveEdit}>
                    <Check />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingKey(undefined)}>
                    <X />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${config.active ? "" : "text-muted-foreground line-through"}`}
                >
                  {config.label}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Switch
                    checked={config.active}
                    onCheckedChange={(checked) => onUpdate(config.key, { active: checked })}
                  />
                  <Button size="icon" variant="ghost" onClick={() => startEdit(config)}>
                    <Pencil />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
