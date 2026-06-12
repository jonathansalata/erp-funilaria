"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentEntryInput,
  type PaymentMethod,
} from "@/lib/mock-data/financeiro";
import { formatCurrency } from "@/lib/utils";

export const CARD_BRANDS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Outra"];

type PaymentMethodsEditorProps = {
  entries: PaymentEntryInput[];
  onChange: (entries: PaymentEntryInput[]) => void;
  targetValue: number;
};

export function getPaymentMethodsTotal(entries: PaymentEntryInput[]): number {
  return entries.reduce((sum, entry) => sum + (entry.value || 0), 0);
}

export function PaymentMethodsEditor({
  entries,
  onChange,
  targetValue,
}: PaymentMethodsEditorProps) {
  const total = getPaymentMethodsTotal(entries);
  const difference = Math.round((targetValue - total) * 100) / 100;

  function updateEntry(index: number, patch: Partial<PaymentEntryInput>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addEntry() {
    const remaining = Math.max(0, Math.round((targetValue - total) * 100) / 100);
    onChange([
      ...entries,
      {
        method: "pix",
        value: remaining,
        paidAt: new Date().toISOString().slice(0, 10),
      },
    ]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {entries.map((entry, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>Forma de pagamento</Label>
                <Select
                  value={entry.method}
                  onValueChange={(value) =>
                    value && updateEntry(index, { method: value as PaymentMethod })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {PAYMENT_METHOD_LABELS[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-36 flex-col gap-1.5">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={entry.value || ""}
                  onChange={(event) => updateEntry(index, { value: Number(event.target.value) })}
                />
              </div>
              <div className="flex w-40 flex-col gap-1.5">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={entry.paidAt ?? ""}
                  onChange={(event) => updateEntry(index, { paidAt: event.target.value })}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => removeEntry(index)}
                disabled={entries.length === 1}
                aria-label="Remover forma de pagamento"
              >
                <Trash2 />
              </Button>
            </div>

            {entry.method === "cartao_credito" && (
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Bandeira</Label>
                  <Select
                    value={entry.cardBrand ?? ""}
                    onValueChange={(value) => value && updateEntry(index, { cardBrand: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bandeira" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-36 flex-col gap-1.5">
                  <Label>Parcelas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    step="1"
                    value={entry.installments ?? 1}
                    onChange={(event) =>
                      updateEntry(index, { installments: Number(event.target.value) || 1 })
                    }
                  />
                </div>
                <div className="flex flex-[2] flex-col gap-1.5">
                  <Label>Observações</Label>
                  <Input
                    value={entry.notes ?? ""}
                    onChange={(event) => updateEntry(index, { notes: event.target.value })}
                    placeholder="Observações sobre o cartão"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addEntry} className="self-start">
        <Plus />
        Adicionar forma de pagamento
      </Button>

      <div className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total das formas de pagamento</span>
          <span className="font-medium">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Valor a registrar</span>
          <span className="font-medium">{formatCurrency(targetValue)}</span>
        </div>
        {difference !== 0 && (
          <p className="text-destructive text-xs">
            A soma das formas de pagamento ({formatCurrency(total)}) deve ser igual ao valor a
            registrar ({formatCurrency(targetValue)}). Diferença:{" "}
            {formatCurrency(Math.abs(difference))}
            {difference > 0 ? " faltando" : " excedente"}.
          </p>
        )}
      </div>
    </div>
  );
}
