"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/mock-data/service-orders-data";

type ChecklistCardProps = {
  title?: string;
  items: ChecklistItem[];
  onItemToggle?: (id: string, done: boolean) => void;
  groupByCategory?: boolean;
  readOnly?: boolean;
  className?: string;
};

export function ChecklistCard({
  title = "Checklist",
  items,
  onItemToggle,
  groupByCategory = false,
  readOnly = false,
  className,
}: ChecklistCardProps) {
  const total = items.length;
  const done = items.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const groups = groupByCategory
    ? items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
        const key = item.category ?? "Geral";
        acc[key] = acc[key] ?? [];
        acc[key].push(item);
        return acc;
      }, {})
    : { "": items };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Progress value={percent} className="mt-2 flex-col gap-1.5">
          <div className="flex w-full items-center justify-between">
            <ProgressLabel className="text-muted-foreground text-xs font-normal">
              {done}/{total} concluídos
            </ProgressLabel>
          </div>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Object.entries(groups).map(([category, groupItems]) => (
          <div key={category || "geral"} className="flex flex-col gap-2">
            {category && (
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {category}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {groupItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    id={item.id}
                    checked={item.done}
                    disabled={readOnly}
                    onCheckedChange={(checked) => onItemToggle?.(item.id, checked === true)}
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn("font-normal", item.done && "text-muted-foreground line-through")}
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
