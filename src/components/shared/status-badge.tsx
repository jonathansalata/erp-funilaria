import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Variantes de cor semânticas usadas para status de negócio (orçamentos, OS, financeiro,
 * jornada do veículo). Os valores reais (label/cor) virão de `config_categories` a partir da
 * Fase 1 — aqui apenas o mapeamento visual `cor semântica -> classes`.
 */
const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/10 text-primary dark:bg-primary/20",
        success: "bg-success/15 text-success",
        warning: "bg-warning/15 text-warning",
        info: "bg-info/15 text-info",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type StatusVariant = NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>;

type StatusBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants> & {
    /** Mostra um indicador circular colorido antes do label, no estilo `config_categories.color`. */
    dot?: boolean;
  };

function StatusBadge({ className, variant, dot = true, children, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", {
            "bg-muted-foreground": variant === "default" || !variant,
            "bg-primary": variant === "primary",
            "bg-success": variant === "success",
            "bg-warning": variant === "warning",
            "bg-info": variant === "info",
            "bg-destructive": variant === "destructive",
          })}
        />
      )}
      {children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
