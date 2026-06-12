"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ServiceOrderItemsEditor } from "@/components/ordens-servico/service-order-items-editor";
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
import { Textarea } from "@/components/ui/textarea";
import type { ServiceOrder, ServiceOrderItem } from "@/lib/mock-data/service-orders-data";
import { useErpDataStore } from "@/stores/erp-data-store";

type ServiceOrderEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ServiceOrder;
};

export function ServiceOrderEditDialog({ open, onOpenChange, order }: ServiceOrderEditDialogProps) {
  const updateServiceOrder = useErpDataStore((state) => state.updateServiceOrder);

  const [items, setItems] = useState<ServiceOrderItem[]>(order.items);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [dueDate, setDueDate] = useState(order.dueDate.slice(0, 10));

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setItems(order.items);
      setNotes(order.notes ?? "");
      setDueDate(order.dueDate.slice(0, 10));
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    if (items.length === 0 || items.some((item) => !item.description.trim())) {
      toast.error("Adicione pelo menos um item com descrição.");
      return;
    }
    if (!dueDate) {
      toast.error("Informe a previsão de entrega.");
      return;
    }

    updateServiceOrder(order.id, {
      items,
      notes: notes.trim() || undefined,
      dueDate,
    });

    toast.success("Ordem de serviço atualizada com sucesso.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar ordem de serviço</DialogTitle>
          <DialogDescription>
            {order.code} · As alterações geram um registro de auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-os-due-date">Previsão de entrega</Label>
              <Input
                id="edit-os-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Itens / Serviços</Label>
            <ServiceOrderItemsEditor items={items} onChange={setItems} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-os-notes">Observações</Label>
            <Textarea
              id="edit-os-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
