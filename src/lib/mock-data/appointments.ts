import type { StatusVariant } from "@/components/shared/status-badge";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";

/**
 * Agenda de compromissos da oficina (entregas, vistorias, retornos e atendimentos),
 * vinculáveis a Cliente/Veículo/Vistoria/Orçamento/OS (Fase 2A, MÓDULO 01).
 */

export type AppointmentType = "entrega" | "vistoria" | "retorno" | "atendimento" | "outros";

export type AppointmentStatus = "agendado" | "concluido" | "cancelado";

export type Appointment = {
  id: string;
  code: string;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  time: string;
  clientId?: string;
  vehicleId?: string;
  inspectionId?: string;
  quoteId?: string;
  serviceOrderId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const APPOINTMENT_TYPE_META: Record<
  AppointmentType,
  { label: string; variant: StatusVariant }
> = {
  entrega: { label: "Entrega", variant: "success" },
  vistoria: { label: "Vistoria", variant: "info" },
  retorno: { label: "Retorno", variant: "warning" },
  atendimento: { label: "Atendimento", variant: "primary" },
  outros: { label: "Outros", variant: "default" },
};

export const APPOINTMENT_STATUS_META: Record<
  AppointmentStatus,
  { label: string; variant: StatusVariant }
> = {
  agendado: { label: "Agendado", variant: "info" },
  concluido: { label: "Concluído", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export const APPOINTMENTS: Appointment[] = [
  {
    id: "apt-001",
    code: "AGD-000001",
    title: "Entrega — Ford Ka (Bruna Tavares)",
    type: "entrega",
    status: "agendado",
    date: "2026-06-11",
    time: "17:00",
    clientId: "cli-010",
    vehicleId: "vei-010",
    serviceOrderId: "os5",
    notes: "Confirmar pagamento antes da retirada.",
    createdAt: "2026-06-08T13:00:00-03:00",
    updatedAt: "2026-06-08T13:00:00-03:00",
  },
  {
    id: "apt-002",
    code: "AGD-000002",
    title: "Vistoria — Fiat Strada (Patrícia Gomes)",
    type: "vistoria",
    status: "agendado",
    date: "2026-06-11",
    time: "09:00",
    clientId: "cli-012",
    vehicleId: "vei-012",
    inspectionId: "vis-001",
    createdAt: "2026-06-10T10:00:00-03:00",
    updatedAt: "2026-06-10T10:00:00-03:00",
  },
  {
    id: "apt-003",
    code: "AGD-000003",
    title: "Atendimento — Toyota Corolla (Juliana Pereira)",
    type: "atendimento",
    status: "agendado",
    date: "2026-06-11",
    time: "14:00",
    clientId: "cli-008",
    vehicleId: "vei-008",
    quoteId: "q8",
    notes: "Cliente quer acompanhar o andamento da OS-2026-000089.",
    createdAt: "2026-06-09T09:00:00-03:00",
    updatedAt: "2026-06-09T09:00:00-03:00",
  },
  {
    id: "apt-004",
    code: "AGD-000004",
    title: "Retorno — Honda Civic (Mariana Costa)",
    type: "retorno",
    status: "agendado",
    date: "2026-06-12",
    time: "10:30",
    clientId: "cli-001",
    vehicleId: "vei-001",
    serviceOrderId: "os8",
    notes: "Verificar alinhamento de porta após reparo anterior.",
    createdAt: "2026-06-09T11:00:00-03:00",
    updatedAt: "2026-06-09T11:00:00-03:00",
  },
  {
    id: "apt-005",
    code: "AGD-000005",
    title: "Entrega — Chevrolet Tracker (Marcos Vinicius)",
    type: "entrega",
    status: "agendado",
    date: "2026-06-12",
    time: "16:00",
    clientId: "cli-011",
    vehicleId: "vei-011",
    serviceOrderId: "os4",
    createdAt: "2026-06-08T10:00:00-03:00",
    updatedAt: "2026-06-08T10:00:00-03:00",
  },
  {
    id: "apt-006",
    code: "AGD-000006",
    title: "Vistoria — HB20 (Carla Souza)",
    type: "vistoria",
    status: "concluido",
    date: "2026-06-10",
    time: "10:00",
    clientId: "cli-004",
    vehicleId: "vei-004",
    inspectionId: "vis-005",
    createdAt: "2026-06-10T08:00:00-03:00",
    updatedAt: "2026-06-10T10:30:00-03:00",
  },
  {
    id: "apt-007",
    code: "AGD-000007",
    title: "Atendimento — Mercedes Sprinter (Transnorte)",
    type: "atendimento",
    status: "agendado",
    date: "2026-06-15",
    time: "11:00",
    clientId: "cli-003",
    vehicleId: "vei-003",
    quoteId: "q3",
    notes: "Apresentar proposta revisada do orçamento ORC-2026-000122.",
    createdAt: "2026-06-10T09:00:00-03:00",
    updatedAt: "2026-06-10T09:00:00-03:00",
  },
  {
    id: "apt-008",
    code: "AGD-000008",
    title: "Entrega — Mercedes Actros (Transnorte)",
    type: "entrega",
    status: "agendado",
    date: "2026-06-18",
    time: "15:30",
    clientId: "cli-003",
    vehicleId: "vei-013",
    serviceOrderId: "os3",
    createdAt: "2026-06-09T08:00:00-03:00",
    updatedAt: "2026-06-09T08:00:00-03:00",
  },
  {
    id: "apt-009",
    code: "AGD-000009",
    title: "Outros — Visita técnica fornecedor de tintas",
    type: "outros",
    status: "agendado",
    date: "2026-06-16",
    time: "09:30",
    notes: "Apresentação de novos produtos para orçamento de pintura.",
    createdAt: "2026-06-09T15:00:00-03:00",
    updatedAt: "2026-06-09T15:00:00-03:00",
  },
  {
    id: "apt-010",
    code: "AGD-000010",
    title: "Retorno — Renault Kwid (Anderson Dias)",
    type: "retorno",
    status: "cancelado",
    date: "2026-06-09",
    time: "13:00",
    clientId: "cli-009",
    vehicleId: "vei-009",
    serviceOrderId: "os7",
    notes: "Cliente remarcou para data posterior.",
    createdAt: "2026-06-07T09:00:00-03:00",
    updatedAt: "2026-06-08T17:00:00-03:00",
  },
];

export function getAppointmentById(id: string): Appointment | undefined {
  return APPOINTMENTS.find((item) => item.id === id);
}

export function getAppointmentsForDate(appointments: Appointment[], date: string): Appointment[] {
  return appointments
    .filter((item) => item.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getUpcomingAppointments(appointments: Appointment[], limit: number): Appointment[] {
  return appointments
    .filter((item) => item.status === "agendado" && item.date >= REFERENCE_DATE)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, limit);
}

export function getTodayDeliveries(appointments: Appointment[]): Appointment[] {
  return appointments.filter(
    (item) => item.type === "entrega" && item.date === REFERENCE_DATE && item.status === "agendado",
  );
}
