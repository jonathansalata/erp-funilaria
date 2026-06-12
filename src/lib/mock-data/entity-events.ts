import {
  Ban,
  CheckSquare,
  CreditCard,
  FilePlus,
  KeyRound,
  Layers,
  LogIn,
  MessageSquare,
  type LucideIcon,
  Paperclip,
  Pencil,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";

import type { StatusVariant } from "@/components/shared/status-badge";
import type { TimelineEntry } from "@/components/shared/timeline";

export type EntityType =
  | "client"
  | "vehicle"
  | "quote"
  | "service_order"
  | "inspection"
  | "receivable"
  | "payable"
  | "auth"
  | "user"
  | "settings";

export type EntityEventType =
  | "created"
  | "updated"
  | "status_changed"
  | "note_added"
  | "file_uploaded"
  | "appointment_scheduled"
  | "payment_received"
  | "payment_partial"
  | "payment_cancelled"
  | "payment_reversed"
  | "payment_method_changed"
  | "installment_changed"
  | "converted_to_os"
  | "checklist_updated"
  | "inactivated"
  | "deleted"
  | "login"
  | "password_reset"
  | "permission_changed";

export type EntityEvent = {
  id: string;
  entityType: EntityType;
  entityId: string;
  eventType: EntityEventType;
  title: string;
  description?: string;
  metadata?: { vehicleId?: string; clientId?: string; [key: string]: unknown };
  createdBy?: string;
  createdAt: string;
};

export const EVENT_ICONS: Record<EntityEventType, LucideIcon> = {
  created: PlusCircle,
  updated: Pencil,
  status_changed: RefreshCw,
  note_added: MessageSquare,
  file_uploaded: Paperclip,
  appointment_scheduled: FilePlus,
  payment_received: FilePlus,
  payment_partial: FilePlus,
  payment_cancelled: XCircle,
  payment_reversed: RotateCcw,
  payment_method_changed: CreditCard,
  installment_changed: Layers,
  converted_to_os: Wrench,
  checklist_updated: CheckSquare,
  inactivated: Ban,
  deleted: Trash2,
  login: LogIn,
  password_reset: KeyRound,
  permission_changed: ShieldCheck,
};

export const EVENT_VARIANTS: Record<EntityEventType, StatusVariant> = {
  created: "default",
  updated: "info",
  status_changed: "info",
  note_added: "default",
  file_uploaded: "default",
  appointment_scheduled: "primary",
  payment_received: "success",
  payment_partial: "info",
  payment_cancelled: "destructive",
  payment_reversed: "warning",
  payment_method_changed: "info",
  installment_changed: "info",
  converted_to_os: "primary",
  checklist_updated: "success",
  inactivated: "warning",
  deleted: "destructive",
  login: "info",
  password_reset: "warning",
  permission_changed: "info",
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  client: "Cliente",
  vehicle: "Veículo",
  quote: "Orçamento",
  service_order: "Ordem de Serviço",
  inspection: "Vistoria",
  receivable: "Conta a Receber",
  payable: "Conta a Pagar",
  auth: "Autenticação",
  user: "Usuário",
  settings: "Configurações",
};

export const EVENT_TYPE_LABELS: Record<EntityEventType, string> = {
  created: "Criação",
  updated: "Atualização",
  status_changed: "Mudança de status",
  note_added: "Observação",
  file_uploaded: "Anexo",
  appointment_scheduled: "Agendamento",
  payment_received: "Pagamento total",
  payment_partial: "Pagamento parcial",
  payment_cancelled: "Recebimento cancelado",
  payment_reversed: "Estorno",
  payment_method_changed: "Mudança de forma de pagamento",
  installment_changed: "Mudança de parcelamento",
  converted_to_os: "Conversão em OS",
  checklist_updated: "Checklist",
  inactivated: "Inativação",
  deleted: "Exclusão",
  login: "Login",
  password_reset: "Redefinição de senha",
  permission_changed: "Alteração de permissões",
};

export const ENTITY_EVENTS: EntityEvent[] = [
  // q1 — Mariana Costa / Honda Civic 2019 (rascunho)
  {
    id: "evt-q1-1",
    entityType: "quote",
    entityId: "q1",
    eventType: "created",
    title: "Orçamento criado",
    description: "Orçamento ORC-2026-000124 criado a partir do atendimento de recepção.",
    metadata: { vehicleId: "vei-001", clientId: "cli-001" },
    createdBy: "Sistema",
    createdAt: "2026-06-11T07:00:00-03:00",
  },
  {
    id: "evt-q1-2",
    entityType: "quote",
    entityId: "q1",
    eventType: "note_added",
    title: "Observação adicionada",
    description: "Cliente relatou colisão leve na traseira.",
    metadata: { vehicleId: "vei-001", clientId: "cli-001" },
    createdBy: "Recepção",
    createdAt: "2026-06-11T09:00:00-03:00",
  },

  // q2 — Pedro Henrique Lima / Fiat Toro 2021 (rascunho)
  {
    id: "evt-q2-1",
    entityType: "quote",
    entityId: "q2",
    eventType: "created",
    title: "Orçamento criado",
    description: "Orçamento ORC-2026-000125 criado a partir do atendimento de recepção.",
    metadata: { vehicleId: "vei-002", clientId: "cli-002" },
    createdBy: "Sistema",
    createdAt: "2026-06-11T05:30:00-03:00",
  },
  {
    id: "evt-q2-2",
    entityType: "quote",
    entityId: "q2",
    eventType: "note_added",
    title: "Observação adicionada",
    description: "Aguardando cotação da peça com fornecedor.",
    metadata: { vehicleId: "vei-002", clientId: "cli-002" },
    createdBy: "Recepção",
    createdAt: "2026-06-11T07:30:00-03:00",
  },

  // q3 — Transnorte / Mercedes Sprinter 2020 (enviado)
  {
    id: "evt-q3-1",
    entityType: "quote",
    entityId: "q3",
    eventType: "created",
    title: "Orçamento criado",
    description: "Orçamento ORC-2026-000122 criado para o veículo VEI-000003.",
    metadata: { vehicleId: "vei-003", clientId: "cli-003" },
    createdBy: "Sistema",
    createdAt: "2026-06-09T10:00:00-03:00",
  },
  {
    id: "evt-q3-2",
    entityType: "quote",
    entityId: "q3",
    eventType: "file_uploaded",
    title: "Anexo adicionado",
    description: "fotos-avaria-lateral.zip enviado.",
    metadata: { vehicleId: "vei-003", clientId: "cli-003" },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-10T16:10:00-03:00",
  },
  {
    id: "evt-q3-3",
    entityType: "quote",
    entityId: "q3",
    eventType: "status_changed",
    title: "Orçamento enviado ao cliente",
    description: "Status alterado de Rascunho para Enviado.",
    metadata: {
      vehicleId: "vei-003",
      clientId: "cli-003",
      fromStatus: "rascunho",
      toStatus: "enviado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-10T16:00:00-03:00",
  },

  // q4 — Carla Souza / Hyundai HB20 2022 (enviado, via vistoria VIS-000008)
  {
    id: "evt-q4-1",
    entityType: "quote",
    entityId: "q4",
    eventType: "created",
    title: "Orçamento gerado a partir da vistoria",
    description: "Orçamento ORC-2026-000121 gerado a partir da vistoria VIS-000008.",
    metadata: { vehicleId: "vei-004", clientId: "cli-004" },
    createdBy: "Sistema",
    createdAt: "2026-06-10T10:30:00-03:00",
  },
  {
    id: "evt-q4-2",
    entityType: "quote",
    entityId: "q4",
    eventType: "status_changed",
    title: "Orçamento enviado ao cliente",
    description: "Status alterado de Rascunho para Enviado.",
    metadata: {
      vehicleId: "vei-004",
      clientId: "cli-004",
      fromStatus: "rascunho",
      toStatus: "enviado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-10T11:00:00-03:00",
  },

  // q5 — Roberto Almeida / Jeep Compass 2018 (enviado, via vistoria VIS-000010)
  {
    id: "evt-q5-1",
    entityType: "quote",
    entityId: "q5",
    eventType: "created",
    title: "Orçamento gerado a partir da vistoria",
    description: "Orçamento ORC-2026-000120 gerado a partir da vistoria VIS-000010.",
    metadata: { vehicleId: "vei-005", clientId: "cli-005" },
    createdBy: "Sistema",
    createdAt: "2026-06-09T09:00:00-03:00",
  },
  {
    id: "evt-q5-2",
    entityType: "quote",
    entityId: "q5",
    eventType: "status_changed",
    title: "Orçamento enviado ao cliente",
    description: "Status alterado de Rascunho para Enviado.",
    metadata: {
      vehicleId: "vei-005",
      clientId: "cli-005",
      fromStatus: "rascunho",
      toStatus: "enviado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-09T10:30:00-03:00",
  },

  // q6 — Fernanda Ribeiro / Chevrolet Onix 2020 (em_negociacao)
  {
    id: "evt-q6-1",
    entityType: "quote",
    entityId: "q6",
    eventType: "created",
    title: "Orçamento gerado a partir da vistoria",
    description: "Orçamento ORC-2026-000118 gerado a partir da vistoria VIS-000009.",
    metadata: { vehicleId: "vei-006", clientId: "cli-006" },
    createdBy: "Sistema",
    createdAt: "2026-06-07T08:00:00-03:00",
  },
  {
    id: "evt-q6-2",
    entityType: "quote",
    entityId: "q6",
    eventType: "status_changed",
    title: "Orçamento enviado ao cliente",
    description: "Status alterado de Rascunho para Enviado.",
    metadata: {
      vehicleId: "vei-006",
      clientId: "cli-006",
      fromStatus: "rascunho",
      toStatus: "enviado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-07T09:00:00-03:00",
  },
  {
    id: "evt-q6-3",
    entityType: "quote",
    entityId: "q6",
    eventType: "file_uploaded",
    title: "Proposta revisada anexada",
    description: "proposta-revisada.pdf enviado.",
    metadata: { vehicleId: "vei-006", clientId: "cli-006" },
    createdBy: "Sistema",
    createdAt: "2026-06-08T09:30:00-03:00",
  },
  {
    id: "evt-q6-4",
    entityType: "quote",
    entityId: "q6",
    eventType: "status_changed",
    title: "Em negociação",
    description:
      "Cliente solicitou desconto adicional na peça. Status alterado para Em negociação.",
    metadata: {
      vehicleId: "vei-006",
      clientId: "cli-006",
      fromStatus: "enviado",
      toStatus: "em_negociacao",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-08T09:15:00-03:00",
  },

  // q7 — Lucas Martins / Volkswagen Gol 2017 (aprovado -> os1)
  {
    id: "evt-q7-1",
    entityType: "quote",
    entityId: "q7",
    eventType: "created",
    title: "Orçamento criado",
    description: "Orçamento ORC-2026-000117 criado.",
    metadata: { vehicleId: "vei-007", clientId: "cli-007" },
    createdBy: "Sistema",
    createdAt: "2026-06-06T11:00:00-03:00",
  },
  {
    id: "evt-q7-2",
    entityType: "quote",
    entityId: "q7",
    eventType: "status_changed",
    title: "Orçamento aprovado pelo cliente",
    description: "Aprovado via telefone.",
    metadata: {
      vehicleId: "vei-007",
      clientId: "cli-007",
      fromStatus: "enviado",
      toStatus: "aprovado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-07T07:50:00-03:00",
  },
  {
    id: "evt-q7-3",
    entityType: "quote",
    entityId: "q7",
    eventType: "converted_to_os",
    title: "Convertido em Ordem de Serviço",
    description: "OS-2026-000090 criada a partir deste orçamento.",
    metadata: { vehicleId: "vei-007", clientId: "cli-007", serviceOrderId: "os1" },
    createdBy: "Sistema",
    createdAt: "2026-06-07T08:05:00-03:00",
  },

  // q8 — Juliana Pereira / Toyota Corolla 2021 (aprovado -> os2)
  {
    id: "evt-q8-1",
    entityType: "quote",
    entityId: "q8",
    eventType: "created",
    title: "Orçamento criado",
    description: "Orçamento ORC-2026-000116 criado.",
    metadata: { vehicleId: "vei-008", clientId: "cli-008" },
    createdBy: "Sistema",
    createdAt: "2026-06-05T13:30:00-03:00",
  },
  {
    id: "evt-q8-2",
    entityType: "quote",
    entityId: "q8",
    eventType: "status_changed",
    title: "Orçamento aprovado pelo cliente",
    description: "Cliente solicitou prioridade na entrega.",
    metadata: {
      vehicleId: "vei-008",
      clientId: "cli-008",
      fromStatus: "enviado",
      toStatus: "aprovado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-06T08:50:00-03:00",
  },
  {
    id: "evt-q8-3",
    entityType: "quote",
    entityId: "q8",
    eventType: "converted_to_os",
    title: "Convertido em Ordem de Serviço",
    description: "OS-2026-000089 criada a partir deste orçamento.",
    metadata: { vehicleId: "vei-008", clientId: "cli-008", serviceOrderId: "os2" },
    createdBy: "Sistema",
    createdAt: "2026-06-06T09:05:00-03:00",
  },

  // q9 — Anderson Dias / Renault Kwid 2019 (recusado)
  {
    id: "evt-q9-1",
    entityType: "quote",
    entityId: "q9",
    eventType: "created",
    title: "Orçamento criado",
    description: "Orçamento ORC-2026-000110 criado.",
    metadata: { vehicleId: "vei-009", clientId: "cli-009" },
    createdBy: "Sistema",
    createdAt: "2026-06-03T10:00:00-03:00",
  },
  {
    id: "evt-q9-2",
    entityType: "quote",
    entityId: "q9",
    eventType: "status_changed",
    title: "Orçamento recusado",
    description: "Cliente optou por utilizar o seguro próprio.",
    metadata: {
      vehicleId: "vei-009",
      clientId: "cli-009",
      fromStatus: "enviado",
      toStatus: "recusado",
    },
    createdBy: "Sistema",
    createdAt: "2026-06-04T15:00:00-03:00",
  },

  // os1 — Lucas Martins / VW Gol 2017 (aguardando_inicio)
  {
    id: "evt-os1-1",
    entityType: "service_order",
    entityId: "os1",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000090 criada a partir do orçamento ORC-2026-000117.",
    metadata: { vehicleId: "vei-007", clientId: "cli-007" },
    createdBy: "Sistema",
    createdAt: "2026-06-07T08:05:00-03:00",
  },

  // os2 — Juliana Pereira / Toyota Corolla 2021 (aguardando_inicio)
  {
    id: "evt-os2-1",
    entityType: "service_order",
    entityId: "os2",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000089 criada a partir do orçamento ORC-2026-000116.",
    metadata: { vehicleId: "vei-008", clientId: "cli-008" },
    createdBy: "Sistema",
    createdAt: "2026-06-06T09:05:00-03:00",
  },

  // os3 — Transnorte / Mercedes Actros 2019 (em_execucao)
  {
    id: "evt-os3-1",
    entityType: "service_order",
    entityId: "os3",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000086 criada para revisão preventiva e reparo de para-lama.",
    metadata: { vehicleId: "vei-013", clientId: "cli-003" },
    createdBy: "Sistema",
    createdAt: "2026-06-09T08:00:00-03:00",
  },
  {
    id: "evt-os3-2",
    entityType: "service_order",
    entityId: "os3",
    eventType: "status_changed",
    title: "Execução iniciada",
    description: "Status alterado de Aguardando início para Em execução.",
    metadata: {
      vehicleId: "vei-013",
      clientId: "cli-003",
      fromStatus: "aguardando_inicio",
      toStatus: "em_execucao",
    },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-10T08:00:00-03:00",
  },
  {
    id: "evt-os3-3",
    entityType: "service_order",
    entityId: "os3",
    eventType: "checklist_updated",
    title: "Checklist atualizado",
    description: "Inspeção e troca de pastilhas/discos concluídas.",
    metadata: { vehicleId: "vei-013", clientId: "cli-003" },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-10T17:30:00-03:00",
  },

  // os4 — Marcos Vinicius / Chevrolet Tracker 2022 (em_execucao)
  {
    id: "evt-os4-1",
    entityType: "service_order",
    entityId: "os4",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000085 criada para reparo de porta traseira.",
    metadata: { vehicleId: "vei-011", clientId: "cli-011" },
    createdBy: "Sistema",
    createdAt: "2026-06-08T10:00:00-03:00",
  },
  {
    id: "evt-os4-2",
    entityType: "service_order",
    entityId: "os4",
    eventType: "status_changed",
    title: "Execução iniciada",
    description: "Status alterado de Aguardando início para Em execução.",
    metadata: {
      vehicleId: "vei-011",
      clientId: "cli-011",
      fromStatus: "aguardando_inicio",
      toStatus: "em_execucao",
    },
    createdBy: "Diego Santos",
    createdAt: "2026-06-09T08:30:00-03:00",
  },
  {
    id: "evt-os4-3",
    entityType: "service_order",
    entityId: "os4",
    eventType: "file_uploaded",
    title: "Foto de antes adicionada",
    description: "antes-porta-traseira.jpg enviado.",
    metadata: { vehicleId: "vei-011", clientId: "cli-011" },
    createdBy: "Diego Santos",
    createdAt: "2026-06-09T09:00:00-03:00",
  },

  // os5 — Bruna Tavares / Ford Ka 2020 (em_execucao, entrega prevista hoje)
  {
    id: "evt-os5-1",
    entityType: "service_order",
    entityId: "os5",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000084 criada para reparo de porta dianteira esquerda.",
    metadata: { vehicleId: "vei-010", clientId: "cli-010" },
    createdBy: "Sistema",
    createdAt: "2026-06-08T13:00:00-03:00",
  },
  {
    id: "evt-os5-2",
    entityType: "service_order",
    entityId: "os5",
    eventType: "status_changed",
    title: "Execução iniciada",
    description: "Status alterado de Aguardando início para Em execução.",
    metadata: {
      vehicleId: "vei-010",
      clientId: "cli-010",
      fromStatus: "aguardando_inicio",
      toStatus: "em_execucao",
    },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-10T08:30:00-03:00",
  },
  {
    id: "evt-os5-3",
    entityType: "service_order",
    entityId: "os5",
    eventType: "file_uploaded",
    title: "Foto de depois adicionada",
    description: "depois-porta-dianteira.jpg enviado.",
    metadata: { vehicleId: "vei-010", clientId: "cli-010" },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-11T07:00:00-03:00",
  },

  // os6 — Patrícia Gomes / Fiat Strada 2021 (aguardando_peca)
  {
    id: "evt-os6-1",
    entityType: "service_order",
    entityId: "os6",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000082 criada para substituição de para-choque traseiro.",
    metadata: { vehicleId: "vei-015", clientId: "cli-012" },
    createdBy: "Sistema",
    createdAt: "2026-06-09T13:00:00-03:00",
  },
  {
    id: "evt-os6-2",
    entityType: "service_order",
    entityId: "os6",
    eventType: "status_changed",
    title: "Aguardando chegada de peça",
    description: "Status alterado de Em execução para Aguardando peça. Previsão de chegada: 18/06.",
    metadata: {
      vehicleId: "vei-015",
      clientId: "cli-012",
      fromStatus: "em_execucao",
      toStatus: "aguardando_peca",
    },
    createdBy: "Diego Santos",
    createdAt: "2026-06-09T14:00:00-03:00",
  },

  // os7 — Anderson Dias / Renault Kwid 2019 (finalizado, pronto para retirada)
  {
    id: "evt-os7-1",
    entityType: "service_order",
    entityId: "os7",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000080 criada para reparo de para-lama dianteiro.",
    metadata: { vehicleId: "vei-009", clientId: "cli-009" },
    createdBy: "Sistema",
    createdAt: "2026-06-07T09:00:00-03:00",
  },
  {
    id: "evt-os7-2",
    entityType: "service_order",
    entityId: "os7",
    eventType: "status_changed",
    title: "Execução iniciada",
    description: "Status alterado de Aguardando início para Em execução.",
    metadata: {
      vehicleId: "vei-009",
      clientId: "cli-009",
      fromStatus: "aguardando_inicio",
      toStatus: "em_execucao",
    },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-10T08:00:00-03:00",
  },
  {
    id: "evt-os7-3",
    entityType: "service_order",
    entityId: "os7",
    eventType: "status_changed",
    title: "Serviço finalizado",
    description: "Status alterado de Em execução para Finalizado. Veículo pronto para retirada.",
    metadata: {
      vehicleId: "vei-009",
      clientId: "cli-009",
      fromStatus: "em_execucao",
      toStatus: "finalizado",
    },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-11T09:30:00-03:00",
  },

  // os8 — Mariana Costa / Honda Civic 2019 (entregue, histórico)
  {
    id: "evt-os8-1",
    entityType: "service_order",
    entityId: "os8",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000078 criada para manutenção preventiva.",
    metadata: { vehicleId: "vei-001", clientId: "cli-001" },
    createdBy: "Sistema",
    createdAt: "2026-06-09T08:00:00-03:00",
  },
  {
    id: "evt-os8-2",
    entityType: "service_order",
    entityId: "os8",
    eventType: "status_changed",
    title: "Veículo entregue ao cliente",
    description: "Status alterado de Finalizado para Entregue.",
    metadata: {
      vehicleId: "vei-001",
      clientId: "cli-001",
      fromStatus: "finalizado",
      toStatus: "entregue",
    },
    createdBy: "Diego Santos",
    createdAt: "2026-06-10T17:00:00-03:00",
  },

  // os9 — Pedro Henrique Lima / Fiat Toro 2021 (entregue, histórico)
  {
    id: "evt-os9-1",
    entityType: "service_order",
    entityId: "os9",
    eventType: "created",
    title: "Ordem de serviço criada",
    description: "OS-2026-000077 criada para reparo de retrovisor e alinhamento.",
    metadata: { vehicleId: "vei-002", clientId: "cli-002" },
    createdBy: "Sistema",
    createdAt: "2026-06-08T09:00:00-03:00",
  },
  {
    id: "evt-os9-2",
    entityType: "service_order",
    entityId: "os9",
    eventType: "status_changed",
    title: "Veículo entregue ao cliente",
    description: "Status alterado de Finalizado para Entregue.",
    metadata: {
      vehicleId: "vei-002",
      clientId: "cli-002",
      fromStatus: "finalizado",
      toStatus: "entregue",
    },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-09T16:30:00-03:00",
  },

  // Vistorias
  {
    id: "evt-vis001-1",
    entityType: "inspection",
    entityId: "vis-001",
    eventType: "created",
    title: "Vistoria criada",
    description: "VIS-000012 aberta na recepção, aguardando início.",
    metadata: { vehicleId: "vei-012", clientId: "cli-012" },
    createdBy: "Recepção",
    createdAt: "2026-06-11T08:30:00-03:00",
  },
  {
    id: "evt-vis002-1",
    entityType: "inspection",
    entityId: "vis-002",
    eventType: "created",
    title: "Vistoria criada",
    description: "VIS-000011 iniciada na recepção.",
    metadata: { vehicleId: "vei-014", clientId: "cli-008" },
    createdBy: "Recepção",
    createdAt: "2026-06-11T09:45:00-03:00",
  },
  {
    id: "evt-vis002-2",
    entityType: "inspection",
    entityId: "vis-002",
    eventType: "checklist_updated",
    title: "Checklist atualizado",
    description: "Itens de pneus e interior concluídos. Avarias registradas na lateral.",
    metadata: { vehicleId: "vei-014", clientId: "cli-008" },
    createdBy: "Recepção",
    createdAt: "2026-06-11T10:15:00-03:00",
  },
  {
    id: "evt-vis003-1",
    entityType: "inspection",
    entityId: "vis-003",
    eventType: "created",
    title: "Vistoria criada",
    description: "VIS-000010 iniciada na recepção.",
    metadata: { vehicleId: "vei-005", clientId: "cli-005" },
    createdBy: "Recepção",
    createdAt: "2026-06-09T08:30:00-03:00",
  },
  {
    id: "evt-vis003-2",
    entityType: "inspection",
    entityId: "vis-003",
    eventType: "status_changed",
    title: "Vistoria concluída — orçamento gerado",
    description:
      "Vistoria concluída. Orçamento ORC-2026-000120 gerado a partir dos danos identificados.",
    metadata: { vehicleId: "vei-005", clientId: "cli-005", quoteId: "q5" },
    createdBy: "Recepção",
    createdAt: "2026-06-09T09:30:00-03:00",
  },
  {
    id: "evt-vis004-1",
    entityType: "inspection",
    entityId: "vis-004",
    eventType: "created",
    title: "Vistoria criada",
    description: "VIS-000009 iniciada na recepção.",
    metadata: { vehicleId: "vei-006", clientId: "cli-006" },
    createdBy: "Recepção",
    createdAt: "2026-06-07T07:30:00-03:00",
  },
  {
    id: "evt-vis004-2",
    entityType: "inspection",
    entityId: "vis-004",
    eventType: "status_changed",
    title: "Vistoria concluída — orçamento gerado",
    description:
      "Vistoria concluída. Orçamento ORC-2026-000118 gerado a partir dos danos identificados.",
    metadata: { vehicleId: "vei-006", clientId: "cli-006", quoteId: "q6" },
    createdBy: "Recepção",
    createdAt: "2026-06-07T08:30:00-03:00",
  },
  {
    id: "evt-vis005-1",
    entityType: "inspection",
    entityId: "vis-005",
    eventType: "created",
    title: "Vistoria criada",
    description: "VIS-000008 iniciada na recepção.",
    metadata: { vehicleId: "vei-004", clientId: "cli-004" },
    createdBy: "Recepção",
    createdAt: "2026-06-10T10:00:00-03:00",
  },
  {
    id: "evt-vis005-2",
    entityType: "inspection",
    entityId: "vis-005",
    eventType: "status_changed",
    title: "Vistoria concluída — orçamento gerado",
    description:
      "Vistoria concluída. Orçamento ORC-2026-000121 gerado a partir dos danos identificados.",
    metadata: { vehicleId: "vei-004", clientId: "cli-004", quoteId: "q4" },
    createdBy: "Recepção",
    createdAt: "2026-06-10T10:30:00-03:00",
  },

  // Login (Módulo 02 — Auditoria avançada): registro de acessos ao sistema (IP mockado)
  {
    id: "evt-login-001",
    entityType: "auth",
    entityId: "usr-001",
    eventType: "login",
    title: "Login no sistema",
    description: "Acesso realizado com sucesso.",
    metadata: { ip: "192.168.0.10" },
    createdBy: "Ana Paula Ferreira",
    createdAt: "2026-06-12T07:45:00-03:00",
  },
  {
    id: "evt-login-002",
    entityType: "auth",
    entityId: "usr-003",
    eventType: "login",
    title: "Login no sistema",
    description: "Acesso realizado com sucesso.",
    metadata: { ip: "192.168.0.22" },
    createdBy: "Patrícia Souza",
    createdAt: "2026-06-12T08:05:00-03:00",
  },
  {
    id: "evt-login-003",
    entityType: "auth",
    entityId: "usr-002",
    eventType: "login",
    title: "Login no sistema",
    description: "Acesso realizado com sucesso.",
    metadata: { ip: "192.168.0.15" },
    createdBy: "Roberto Lima",
    createdAt: "2026-06-11T18:20:00-03:00",
  },
  {
    id: "evt-login-004",
    entityType: "auth",
    entityId: "usr-004",
    eventType: "login",
    title: "Login no sistema",
    description: "Acesso realizado com sucesso.",
    metadata: { ip: "192.168.0.31" },
    createdBy: "Carlos Eduardo",
    createdAt: "2026-06-11T17:30:00-03:00",
  },

  // Usuários (Módulo 01): exemplo de evento de alteração de permissões
  {
    id: "evt-user-001",
    entityType: "user",
    entityId: "usr-006",
    eventType: "permission_changed",
    title: "Permissões personalizadas atribuídas",
    description:
      "Perfil alterado de Operacional para Personalizado; permissões ajustadas para acesso restrito de recepção.",
    createdBy: "Ana Paula Ferreira",
    createdAt: "2026-05-20T08:10:00-03:00",
  },
  {
    id: "evt-user-002",
    entityType: "user",
    entityId: "usr-006",
    eventType: "password_reset",
    title: "Senha redefinida pelo administrador",
    description: "Senha redefinida e bloqueio aplicado após tentativas de acesso fora do horário.",
    createdBy: "Ana Paula Ferreira",
    createdAt: "2026-06-05T09:15:00-03:00",
  },
];

export function getEventsForEntity(
  events: EntityEvent[],
  entityType: EntityType,
  entityId: string,
): EntityEvent[] {
  return events
    .filter((event) => event.entityType === entityType && event.entityId === entityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getVehicleTimeline(events: EntityEvent[], vehicleId: string): EntityEvent[] {
  return events
    .filter(
      (event) =>
        event.metadata?.vehicleId === vehicleId ||
        (event.entityType === "vehicle" && event.entityId === vehicleId),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getClientTimeline(events: EntityEvent[], clientId: string): EntityEvent[] {
  return events
    .filter(
      (event) =>
        event.metadata?.clientId === clientId ||
        (event.entityType === "client" && event.entityId === clientId),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRecentEvents(events: EntityEvent[], limit: number): EntityEvent[] {
  return [...events]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function mapEntityEventToTimelineEntry(event: EntityEvent): TimelineEntry {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    timestamp: event.createdAt,
    icon: EVENT_ICONS[event.eventType],
    variant: EVENT_VARIANTS[event.eventType],
    author: event.createdBy,
  };
}
