"use client";

import { useState } from "react";
import { History } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type StatusOption = { value: string; label: string };

type StatusOverrideActionProps = {
  currentStatus: string;
  options: StatusOption[];
  entityLabel: string;
  onConfirm: (status: string, reason: string) => void;
};

/**
 * Ação de alteração manual de status (reversão controlada), disponível para Orçamentos e
 * Ordens de Serviço. Permite mover a entidade para qualquer status — incluindo retorno a
 * etapas anteriores ou cancelamento — mediante confirmação e justificativa, registradas no
 * histórico de status da entidade.
 */
export function StatusOverrideAction({
  currentStatus,
  options,
  entityLabel,
  onConfirm,
}: StatusOverrideActionProps) {
  const [open, setOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (value) {
      setTargetStatus(currentStatus);
      setReason("");
    }
  }

  function handleConfirm() {
    if (!targetStatus || !reason.trim()) return;
    onConfirm(targetStatus, reason.trim());
    setOpen(false);
  }

  return (
    <>
      <Button variant="outline" onClick={() => handleOpenChange(true)}>
        <History />
        Alterar status
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar status manualmente</DialogTitle>
            <DialogDescription>
              Selecione o novo status para {entityLabel} e informe o motivo da alteração. Esta ação
              é registrada no histórico de status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status-override-select">Novo status</Label>
              <Select
                value={targetStatus}
                onValueChange={(value) => value && setTargetStatus(value)}
              >
                <SelectTrigger id="status-override-select" className="w-full">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status-override-reason">Motivo</Label>
              <Textarea
                id="status-override-reason"
                placeholder="Descreva o motivo da alteração de status..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!targetStatus || !reason.trim()}>
              Confirmar alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
