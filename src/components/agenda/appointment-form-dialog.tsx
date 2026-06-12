"use client";

import { useState } from "react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
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
import {
  APPOINTMENT_TYPE_META,
  type Appointment,
  type AppointmentType,
} from "@/lib/mock-data/appointments";
import { getVehicleLabel } from "@/lib/mock-data/vehicles";
import { useErpDataStore } from "@/stores/erp-data-store";

export type AppointmentFormValues = {
  title: string;
  type: AppointmentType;
  date: string;
  time: string;
  clientId?: string;
  vehicleId?: string;
  inspectionId?: string;
  quoteId?: string;
  serviceOrderId?: string;
  notes?: string;
};

type AppointmentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment;
  defaultDate?: string;
  onSubmit: (values: AppointmentFormValues) => void;
  onCancelAppointment?: () => void;
  onDelete?: () => void;
};

const EMPTY_VALUES: AppointmentFormValues = {
  title: "",
  type: "atendimento",
  date: "",
  time: "09:00",
  clientId: undefined,
  vehicleId: undefined,
  inspectionId: undefined,
  quoteId: undefined,
  serviceOrderId: undefined,
  notes: "",
};

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
  defaultDate,
  onSubmit,
  onCancelAppointment,
  onDelete,
}: AppointmentFormDialogProps) {
  const vehicles = useErpDataStore((state) => state.vehicles);
  const inspections = useErpDataStore((state) => state.inspections);
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);

  const [values, setValues] = useState<AppointmentFormValues>(EMPTY_VALUES);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handleOpenChange(value: boolean) {
    if (value) {
      if (appointment) {
        setValues({
          title: appointment.title,
          type: appointment.type,
          date: appointment.date,
          time: appointment.time,
          clientId: appointment.clientId,
          vehicleId: appointment.vehicleId,
          inspectionId: appointment.inspectionId,
          quoteId: appointment.quoteId,
          serviceOrderId: appointment.serviceOrderId,
          notes: appointment.notes ?? "",
        });
      } else {
        setValues({ ...EMPTY_VALUES, date: defaultDate ?? EMPTY_VALUES.date });
      }
    }
    onOpenChange(value);
  }

  const vehiclesForClient = values.clientId
    ? vehicles.filter((vehicle) => vehicle.clientId === values.clientId)
    : [];
  const inspectionsForVehicle = values.vehicleId
    ? inspections.filter((inspection) => inspection.vehicleId === values.vehicleId)
    : [];
  const quotesForVehicle = values.vehicleId
    ? quotes.filter((quote) => quote.vehicleId === values.vehicleId)
    : [];
  const serviceOrdersForVehicle = values.vehicleId
    ? serviceOrders.filter((order) => order.vehicleId === values.vehicleId)
    : [];

  const isValid = values.title.trim() !== "" && values.date !== "" && values.time !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      ...values,
      title: values.title.trim(),
      notes: values.notes?.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar compromisso" : "Novo compromisso"}</DialogTitle>
          <DialogDescription>
            Agende entregas, vistorias, retornos e atendimentos da oficina.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appointment-title">Título</Label>
            <Input
              id="appointment-title"
              placeholder="Ex: Entrega — Honda Civic (Mariana Costa)"
              value={values.title}
              onChange={(event) => setValues((v) => ({ ...v, title: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-type">Tipo</Label>
              <Select
                value={values.type}
                onValueChange={(value) =>
                  value && setValues((v) => ({ ...v, type: value as AppointmentType }))
                }
              >
                <SelectTrigger id="appointment-type" className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPOINTMENT_TYPE_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointment-date">Data</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={values.date}
                  onChange={(event) => setValues((v) => ({ ...v, date: event.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointment-time">Hora</Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={values.time}
                  onChange={(event) => setValues((v) => ({ ...v, time: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-client">Cliente</Label>
              <Select
                value={values.clientId ?? "none"}
                onValueChange={(value) =>
                  setValues((v) => ({
                    ...v,
                    clientId: value === "none" ? undefined : (value as string),
                    vehicleId: undefined,
                    inspectionId: undefined,
                    quoteId: undefined,
                    serviceOrderId: undefined,
                  }))
                }
              >
                <SelectTrigger id="appointment-client" className="w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {CLIENTS.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-vehicle">Veículo</Label>
              <Select
                value={values.vehicleId ?? "none"}
                onValueChange={(value) =>
                  setValues((v) => ({
                    ...v,
                    vehicleId: value === "none" ? undefined : (value as string),
                    inspectionId: undefined,
                    quoteId: undefined,
                    serviceOrderId: undefined,
                  }))
                }
              >
                <SelectTrigger
                  id="appointment-vehicle"
                  className="w-full"
                  disabled={!values.clientId}
                >
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {vehiclesForClient.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {getVehicleLabel(vehicle)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {values.vehicleId && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointment-inspection">Vistoria</Label>
                <Select
                  value={values.inspectionId ?? "none"}
                  onValueChange={(value) =>
                    setValues((v) => ({
                      ...v,
                      inspectionId: value === "none" ? undefined : (value as string),
                    }))
                  }
                >
                  <SelectTrigger id="appointment-inspection" className="w-full">
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {inspectionsForVehicle.map((inspection) => (
                      <SelectItem key={inspection.id} value={inspection.id}>
                        {inspection.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointment-quote">Orçamento</Label>
                <Select
                  value={values.quoteId ?? "none"}
                  onValueChange={(value) =>
                    setValues((v) => ({
                      ...v,
                      quoteId: value === "none" ? undefined : (value as string),
                    }))
                  }
                >
                  <SelectTrigger id="appointment-quote" className="w-full">
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {quotesForVehicle.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        {quote.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="appointment-os">Ordem de Serviço</Label>
                <Select
                  value={values.serviceOrderId ?? "none"}
                  onValueChange={(value) =>
                    setValues((v) => ({
                      ...v,
                      serviceOrderId: value === "none" ? undefined : (value as string),
                    }))
                  }
                >
                  <SelectTrigger id="appointment-os" className="w-full">
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {serviceOrdersForVehicle.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appointment-notes">Observações</Label>
            <Textarea
              id="appointment-notes"
              placeholder="Observações adicionais..."
              value={values.notes}
              onChange={(event) => setValues((v) => ({ ...v, notes: event.target.value }))}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            {appointment && onDelete && (
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                Excluir
              </Button>
            )}
            {appointment && appointment.status === "agendado" && onCancelAppointment && (
              <Button
                variant="outline"
                onClick={() => {
                  onCancelAppointment();
                  onOpenChange(false);
                }}
              >
                Cancelar agendamento
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid}>
              {appointment ? "Salvar alterações" : "Criar compromisso"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          onDelete?.();
          onOpenChange(false);
        }}
        itemLabel={appointment ? `o compromisso "${appointment.title}"` : undefined}
      />
    </Dialog>
  );
}
