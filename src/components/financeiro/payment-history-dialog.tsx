"use client";

import { CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Timeline, type TimelineEntry } from "@/components/shared/timeline";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STAGE_LABELS,
  type PaymentEntry,
} from "@/lib/mock-data/financeiro";
import { formatCurrency } from "@/lib/utils";

type PaymentHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  payments?: PaymentEntry[];
};

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  title,
  payments,
}: PaymentHistoryDialogProps) {
  const entries: TimelineEntry[] = (payments ?? []).map((payment) => {
    const parts: string[] = [];
    if (payment.cardBrand) parts.push(payment.cardBrand);
    if (payment.installments && payment.installments > 1) parts.push(`${payment.installments}x`);
    if (payment.stage) parts.push(PAYMENT_STAGE_LABELS[payment.stage]);
    if (payment.notes) parts.push(payment.notes);

    return {
      id: payment.id,
      title: `${PAYMENT_METHOD_LABELS[payment.method]} — ${formatCurrency(payment.value)}`,
      description: parts.join(" · ") || undefined,
      timestamp: payment.paidAt,
      icon: CreditCard,
      variant: "success",
      author: payment.createdBy,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico de recebimentos</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <Timeline entries={entries} emptyMessage="Nenhum recebimento registrado." />
      </DialogContent>
    </Dialog>
  );
}
