import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge";

type EntityHeaderProps = {
  title: string;
  code?: string;
  status?: { label: string; variant?: StatusVariant };
  description?: string;
  backHref: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function EntityHeader({
  title,
  code,
  status,
  description,
  backHref,
  backLabel = "Voltar",
  actions,
}: EntityHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link href={backHref} />}>
        <ChevronLeft />
        {backLabel}
      </Button>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold">{title}</h1>
            {code && <Badge variant="outline">{code}</Badge>}
            {status && <StatusBadge variant={status.variant}>{status.label}</StatusBadge>}
          </div>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
