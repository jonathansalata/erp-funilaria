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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_STAGE_LABELS,
  getReceivableBalance,
  type PaymentEntryInput,
  type PaymentStage,
  type Receivable,
} from "@/lib/mock-data/financeiro";
import { formatCurrency } from "@/lib/utils";

type ReceivePaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable?: Receivable;
  onConfirm: (amount: number, payments: PaymentEntryInput[]) => void;
};

const STAGES: PaymentStage[] = ["orcamento", "execucao", "entrega", "outro"];

export function ReceivePaymentDialog({
  open,
  onOpenChange,
  receivable,
  onConfirm,
}: ReceivePaymentDialogProps) {
  const [amount, setAmount] = useState(0);
  const [stage, setStage] = useState<PaymentStage>("entrega");
  const [entries, setEntries] = useState<PaymentEntryInput[]>([]);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && receivable) {
      const remaining = getReceivableBalance(receivable);
      setAmount(remaining);
      setStage("entrega");
      setEntries([
        { method: "pix", value: remaining, paidAt: new Date().toISOString().slice(0, 10) },
      ]);
    } else if (!open) {
      setAmount(0);
      setStage("entrega");
      setEntries([]);
    }
  }

  if (!receivable) return null;

  const remaining = getReceivableBalance(receivable);
  const total = getPaymentMethodsTotal(entries);
  const isAmountValid = amount > 0 && amount <= remaining;
  const isSumValid = Math.abs(total - amount) < 0.005;
  const isValid = isAmountValid && isSumValid && entries.length > 0;

  function handleAmountChange(value: number) {
    setAmount(value);
  }

  function handleConfirm() {
    if (!isValid) return;
    onConfirm(
      amount,
      entries.map((entry) => ({ ...entry, stage })),
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Receber pagamento</DialogTitle>
          <DialogDescription>
            {receivable.document} · Saldo em aberto: {formatCurrency(remaining)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="receive-amount">Valor a registrar agora</Label>
              <Input
                id="receive-amount"
                type="number"
                min="0"
                max={remaining}
                step="0.01"
                value={amount || ""}
                onChange={(event) => handleAmountChange(Number(event.target.value))}
              />
              {amount > remaining && (
                <p className="text-destructive text-xs">
                  O valor não pode ser maior que o saldo em aberto.
                </p>
              )}
              {amount > 0 && amount < receivable.value - (receivable.receivedValue ?? 0) && (
                <p className="text-muted-foreground text-xs">
                  Pagamento parcial — saldo pendente após este recebimento:{" "}
                  {formatCurrency(remaining - amount)}.
                </p>
              )}
            </div>
            <div className="flex w-48 flex-col gap-1.5">
              <Label htmlFor="receive-stage">Etapa da operação</Label>
              <Select
                value={stage}
                onValueChange={(value) => value && setStage(value as PaymentStage)}
              >
                <SelectTrigger id="receive-stage">
                  <SelectValue placeholder="Etapa" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {PAYMENT_STAGE_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <PaymentMethodsEditor entries={entries} onChange={setEntries} targetValue={amount} />
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
