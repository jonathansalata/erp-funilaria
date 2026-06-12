"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Receivable } from "@/lib/mock-data/financeiro";
import { formatCurrency } from "@/lib/utils";

type ReceivePaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable?: Receivable;
  onConfirm: (value: number) => void;
};

export function ReceivePaymentDialog({
  open,
  onOpenChange,
  receivable,
  onConfirm,
}: ReceivePaymentDialogProps) {
  const [value, setValue] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && receivable) {
      setValue(receivable.value - (receivable.receivedValue ?? 0));
    }
    onOpenChange(nextOpen);
  }

  if (!receivable) return null;

  const remaining = receivable.value - (receivable.receivedValue ?? 0);
  const isValid = value > 0 && value <= remaining;

  function handleConfirm() {
    if (!isValid) return;
    onConfirm(value);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Receber pagamento</DialogTitle>
          <DialogDescription>
            {receivable.document} · Saldo em aberto: {formatCurrency(remaining)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="receive-value">Valor recebido</Label>
          <Input
            id="receive-value"
            type="number"
            min="0"
            max={remaining}
            step="0.01"
            value={value || ""}
            onChange={(event) => setValue(Number(event.target.value))}
          />
          {value > remaining && (
            <p className="text-destructive text-xs">
              O valor não pode ser maior que o saldo em aberto.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Confirmar recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
