"use client";

import { useState } from "react";
import { CreditCard, RotateCcw } from "lucide-react";

import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

type ReversePaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  payments?: PaymentEntry[];
  /** Estorna um único lançamento (estorno parcial). */
  onReversePayment: (paymentId: string) => void;
  /** Estorna todos os lançamentos, devolvendo o título para "Aberto" (estorno total). */
  onReverseAll: () => void;
};

/**
 * Fluxo de estorno (Fase 2B.6.1, Bloco 17): lista todos os lançamentos
 * registrados e permite estornar individualmente (parcial) ou todos de uma
 * vez (total), sempre com confirmação. Substitui o estorno direto sem
 * seleção e o "Estornar" indevido dentro do Histórico (que agora é apenas
 * consulta).
 */
export function ReversePaymentDialog({
  open,
  onOpenChange,
  title,
  payments,
  onReversePayment,
  onReverseAll,
}: ReversePaymentDialogProps) {
  const [reversingPaymentId, setReversingPaymentId] = useState<string | undefined>(undefined);
  const [reversingAll, setReversingAll] = useState(false);

  const entriesList = payments ?? [];
  const reversingPayment = entriesList.find((payment) => payment.id === reversingPaymentId);

  const entries: TimelineEntry[] = entriesList.map((payment) => {
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
      variant: "warning",
      author: payment.createdBy,
      actions: (
        <Button size="sm" variant="outline" onClick={() => setReversingPaymentId(payment.id)}>
          Estornar
        </Button>
      ),
    };
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Estornar lançamentos</DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>
          <Timeline entries={entries} emptyMessage="Nenhum lançamento registrado para estornar." />
          {entriesList.length > 0 && (
            <DialogFooter>
              <Button variant="destructive" onClick={() => setReversingAll(true)}>
                <RotateCcw />
                Estornar tudo
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(reversingPaymentId)}
        onOpenChange={(nextOpen) => !nextOpen && setReversingPaymentId(undefined)}
        onConfirm={() => {
          if (reversingPaymentId) onReversePayment(reversingPaymentId);
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

      <ConfirmActionDialog
        open={reversingAll}
        onOpenChange={setReversingAll}
        onConfirm={() => {
          onReverseAll();
          onOpenChange(false);
        }}
        title="Estornar todos os lançamentos"
        description={`Tem certeza de que deseja estornar todos os lançamentos de ${title}? O valor será revertido e o título voltará para "Aberto". Esta ação será registrada no histórico de auditoria.`}
        confirmLabel="Estornar tudo"
        variant="destructive"
      />
    </>
  );
}
