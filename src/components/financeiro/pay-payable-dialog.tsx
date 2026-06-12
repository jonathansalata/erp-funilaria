"use client";

import { useState } from "react";

import {
  getPaymentMethodsTotal,
  PaymentMethodsEditor,
} from "@/components/financeiro/payment-methods-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Payable, PaymentEntryInput } from "@/lib/mock-data/financeiro";
import { formatCurrency } from "@/lib/utils";

type PayPayableDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payable?: Payable;
  onConfirm: (payments: PaymentEntryInput[]) => void;
};

export function PayPayableDialog({
  open,
  onOpenChange,
  payable,
  onConfirm,
}: PayPayableDialogProps) {
  const [entries, setEntries] = useState<PaymentEntryInput[]>([]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && payable) {
      setEntries([
        {
          method: "transferencia",
          value: payable.value,
          paidAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
    onOpenChange(nextOpen);
  }

  if (!payable) return null;

  const total = getPaymentMethodsTotal(entries);
  const isValid = entries.length > 0 && Math.abs(total - payable.value) < 0.005;

  function handleConfirm() {
    if (!isValid) return;
    onConfirm(entries);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            {payable.supplier} · Valor: {formatCurrency(payable.value)}
          </DialogDescription>
        </DialogHeader>

        <PaymentMethodsEditor entries={entries} onChange={setEntries} targetValue={payable.value} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
