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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PAYABLE_CATEGORY_LABELS,
  type Payable,
  type PayableCategory,
} from "@/lib/mock-data/financeiro";

export type PayableFormValues = {
  supplier: string;
  category: PayableCategory;
  description?: string;
  value: number;
  dueDate: string;
};

type PayableFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payable?: Payable;
  onSubmit: (values: PayableFormValues) => void;
};

const EMPTY_VALUES: PayableFormValues = {
  supplier: "",
  category: "fornecedores",
  description: "",
  value: 0,
  dueDate: "",
};

export function PayableFormDialog({
  open,
  onOpenChange,
  payable,
  onSubmit,
}: PayableFormDialogProps) {
  const [values, setValues] = useState<PayableFormValues>(EMPTY_VALUES);

  function handleOpenChange(value: boolean) {
    if (value) {
      if (payable) {
        setValues({
          supplier: payable.supplier,
          category: payable.category,
          description: payable.description ?? "",
          value: payable.value,
          dueDate: payable.dueDate,
        });
      } else {
        setValues(EMPTY_VALUES);
      }
    }
    onOpenChange(value);
  }

  const isValid = values.supplier.trim() !== "" && values.value > 0 && values.dueDate !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      ...values,
      supplier: values.supplier.trim(),
      description: values.description?.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{payable ? "Editar conta" : "Nova conta a pagar"}</DialogTitle>
          <DialogDescription>
            Lançamentos de contas a pagar a fornecedores e despesas da oficina.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payable-supplier">Fornecedor</Label>
              <Input
                id="payable-supplier"
                placeholder="Ex: AutoPeças Distribuidora LTDA"
                value={values.supplier}
                onChange={(event) => setValues((v) => ({ ...v, supplier: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payable-category">Categoria</Label>
              <Select
                value={values.category}
                onValueChange={(value) =>
                  value && setValues((v) => ({ ...v, category: value as PayableCategory }))
                }
              >
                <SelectTrigger id="payable-category" className="w-full">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYABLE_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payable-value">Valor</Label>
              <Input
                id="payable-value"
                type="number"
                min="0"
                step="0.01"
                value={values.value || ""}
                onChange={(event) =>
                  setValues((v) => ({ ...v, value: Number(event.target.value) }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payable-due-date">Vencimento</Label>
              <Input
                id="payable-due-date"
                type="date"
                value={values.dueDate}
                onChange={(event) => setValues((v) => ({ ...v, dueDate: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payable-description">Descrição</Label>
            <Textarea
              id="payable-description"
              placeholder="Descrição da conta..."
              value={values.description}
              onChange={(event) => setValues((v) => ({ ...v, description: event.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {payable ? "Salvar alterações" : "Criar conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
