import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KpiCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  className?: string;
};

/** Card de indicador (KPI) usado nos dashboards Operacional e Gerencial. */
export function KpiCard({ title, value, icon: Icon, description, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("gap-2", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground size-4 shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="font-heading text-2xl font-semibold">{value}</div>
        {(description || trend) && (
          <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  trend.direction === "up" ? "text-success" : "text-destructive",
                )}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {trend.value}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
