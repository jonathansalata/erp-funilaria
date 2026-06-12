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
import { CLIENTS } from "@/lib/mock-data/clients";
import type { Receivable } from "@/lib/mock-data/financeiro";

export type ReceivableFormValues = {
  clientId: string;
  document: string;
  description?: string;
  value: number;
  dueDate: string;
};

type ReceivableFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable?: Receivable;
  onSubmit: (values: ReceivableFormValues) => void;
};

const EMPTY_VALUES: ReceivableFormValues = {
  clientId: "",
  document: "",
  description: "",
  value: 0,
  dueDate: "",
};

export function ReceivableFormDialog({
  open,
  onOpenChange,
  receivable,
  onSubmit,
}: ReceivableFormDialogProps) {
  const [values, setValues] = useState<ReceivableFormValues>(EMPTY_VALUES);

  function handleOpenChange(value: boolean) {
    if (value) {
      if (receivable) {
        setValues({
          clientId: receivable.clientId,
          document: receivable.document,
          description: receivable.description ?? "",
          value: receivable.value,
          dueDate: receivable.dueDate,
        });
      } else {
        setValues(EMPTY_VALUES);
      }
    }
    onOpenChange(value);
  }

  const isValid =
    values.clientId !== "" &&
    values.document.trim() !== "" &&
    values.value > 0 &&
    values.dueDate !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      ...values,
      document: values.document.trim(),
      description: values.description?.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{receivable ? "Editar título" : "Novo título a receber"}</DialogTitle>
          <DialogDescription>
            Lançamentos de contas a receber vinculados a clientes da oficina.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receivable-client">Cliente</Label>
              <Select
                value={values.clientId || undefined}
                onValueChange={(value) =>
                  value && setValues((v) => ({ ...v, clientId: value as string }))
                }
              >
                <SelectTrigger id="receivable-client" className="w-full">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receivable-document">Documento</Label>
              <Input
                id="receivable-document"
                placeholder="Ex: ORC-2026-000123"
                value={values.document}
                onChange={(event) => setValues((v) => ({ ...v, document: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receivable-value">Valor</Label>
              <Input
                id="receivable-value"
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
              <Label htmlFor="receivable-due-date">Vencimento</Label>
              <Input
                id="receivable-due-date"
                type="date"
                value={values.dueDate}
                onChange={(event) => setValues((v) => ({ ...v, dueDate: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="receivable-description">Descrição</Label>
            <Textarea
              id="receivable-description"
              placeholder="Descrição do título..."
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
            {receivable ? "Salvar alterações" : "Criar título"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
