"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AppointmentCalendar } from "@/components/agenda/appointment-calendar";
import {
  AppointmentFormDialog,
  type AppointmentFormValues,
} from "@/components/agenda/appointment-form-dialog";
import { AppointmentList } from "@/components/agenda/appointment-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment } from "@/lib/mock-data/appointments";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import { useErpDataStore } from "@/stores/erp-data-store";

export function AgendaView() {
  const appointments = useErpDataStore((state) => state.appointments);
  const createAppointment = useErpDataStore((state) => state.createAppointment);
  const updateAppointment = useErpDataStore((state) => state.updateAppointment);
  const changeAppointmentStatus = useErpDataStore((state) => state.changeAppointmentStatus);
  const deleteAppointment = useErpDataStore((state) => state.deleteAppointment);

  const [selectedDate, setSelectedDate] = useState(REFERENCE_DATE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);

  function openNewAppointment() {
    setEditingAppointment(undefined);
    setDialogOpen(true);
  }

  function openAppointment(appointment: Appointment) {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  }

  function handleSubmit(values: AppointmentFormValues) {
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, values);
    } else {
      createAppointment(values);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Agenda</h1>
          <p className="text-muted-foreground text-sm">
            Compromissos de entregas, vistorias, retornos e atendimentos da oficina.
          </p>
        </div>
        <Button onClick={openNewAppointment}>
          <Plus />
          Novo compromisso
        </Button>
      </div>

      <Tabs defaultValue="calendario">
        <TabsList>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="calendario" className="pt-4">
          <AppointmentCalendar
            appointments={appointments}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAppointmentClick={openAppointment}
          />
        </TabsContent>
        <TabsContent value="lista" className="pt-4">
          <AppointmentList appointments={appointments} onRowClick={openAppointment} />
        </TabsContent>
      </Tabs>

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editingAppointment}
        defaultDate={selectedDate}
        onSubmit={handleSubmit}
        onCancelAppointment={
          editingAppointment
            ? () => changeAppointmentStatus(editingAppointment.id, "cancelado")
            : undefined
        }
        onDelete={editingAppointment ? () => deleteAppointment(editingAppointment.id) : undefined}
      />
    </div>
  );
}
