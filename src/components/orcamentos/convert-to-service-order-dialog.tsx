"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Quote } from "@/lib/mock-data/quotes-data";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { useErpDataStore } from "@/stores/erp-data-store";

type ConvertToServiceOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onConfirm: (input: { dueDate: string; createAppointment: boolean; time: string }) => void;
};

function addDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Confirmação inteligente da conversão Orçamento → OS (Fase 2B.6, Bloco 04):
 * solicita data/hora de entrega prevista, oferece criação automática do
 * agendamento de entrega e alerta sobre conflitos de horário na Agenda.
 */
export function ConvertToServiceOrderDialog({
  open,
  onOpenChange,
  quote,
  onConfirm,
}: ConvertToServiceOrderDialogProps) {
  const appointments = useErpDataStore((state) => state.appointments);

  const [dueDate, setDueDate] = useState(addDays(REFERENCE_DATE, 3));
  const [time, setTime] = useState("09:00");
  const [createAppointment, setCreateAppointment] = useState(true);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDueDate(addDays(REFERENCE_DATE, 3));
      setTime("09:00");
      setCreateAppointment(true);
    }
  }

  const hasConflict =
    createAppointment &&
    appointments.some(
      (appointment) =>
        appointment.status === "agendado" &&
        appointment.date === dueDate &&
        appointment.time === time,
    );

  function handleConfirm() {
    onConfirm({ dueDate, createAppointment, time });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converter em Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Confirma a conversão do orçamento {quote.code} em uma Ordem de Serviço?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-due-date">Data de entrega prevista</Label>
              <Input
                id="convert-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-due-time">Horário de entrega previsto</Label>
              <Input
                id="convert-due-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>

          <Label className="flex items-start gap-2 font-normal">
            <Checkbox
              checked={createAppointment}
              onCheckedChange={(checked) => setCreateAppointment(checked === true)}
            />
            <span>
              Criar automaticamente um agendamento de entrega na Agenda com esta data e horário.
            </span>
          </Label>

          {hasConflict && (
            <div className="bg-warning/10 text-warning flex items-start gap-2 rounded-md p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                Já existe um agendamento previsto para esta data e horário. Revise a Agenda antes de
                confirmar para evitar conflitos.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Converter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
