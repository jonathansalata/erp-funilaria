"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
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
  /** Quando informado, exibe a opção de estorno individual por lançamento (Fase 2B.6, Bloco 08). */
  onReversePayment?: (paymentId: string) => void;
};

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  title,
  payments,
  onReversePayment,
}: PaymentHistoryDialogProps) {
  const [reversingPaymentId, setReversingPaymentId] = useState<string | undefined>(undefined);

  const reversingPayment = (payments ?? []).find((payment) => payment.id === reversingPaymentId);

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
      actions: onReversePayment ? (
        <Button size="sm" variant="outline" onClick={() => setReversingPaymentId(payment.id)}>
          Estornar
        </Button>
      ) : undefined,
    };
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Histórico de recebimentos</DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>
          <Timeline entries={entries} emptyMessage="Nenhum recebimento registrado." />
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(reversingPaymentId)}
        onOpenChange={(nextOpen) => !nextOpen && setReversingPaymentId(undefined)}
        onConfirm={() => {
          if (reversingPaymentId) {
            onReversePayment?.(reversingPaymentId);
          }
        }}
        title="Estornar lançamento"
        description={`Tem certeza de que deseja estornar o lançamento de ${
          reversingPayment
            ? `${PAYMENT_METHOD_LABELS[reversingPayment.method]} — ${formatCurrency(reversingPayment.value)}`
            : ""
        }? Esta ação será registrada no histórico de auditoria.`}
        confirmLabel="Estornar"
        variant="destructive"
      />
    </>
  );
}
