import type { Attachment } from "@/lib/mock-data/attachments";

export type ServiceOrderStatus =
  | "aguardando_inicio"
  | "em_execucao"
  | "aguardando_peca"
  | "finalizado"
  | "entregue";

export type ServiceOrderItem = {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  category?: string;
};

export type TimeLog = {
  id: string;
  technicianId: string;
  description: string;
  hours: number;
  date: string;
};

export type ServiceOrder = {
  id: string;
  code: string;
  clientId: string;
  vehicleId: string;
  status: ServiceOrderStatus;
  technicianId: string;
  quoteId?: string;
  items: ServiceOrderItem[];
  checklist: ChecklistItem[];
  timeLogs: TimeLog[];
  photos: Attachment[];
  notes?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export const SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: "os1",
    code: "OS-2026-000090",
    clientId: "cli-007",
    vehicleId: "vei-007",
    status: "aguardando_inicio",
    technicianId: "tec-003",
    quoteId: "q7",
    items: [
      {
        id: "os1-i1",
        description: "Reparo de lataria - porta-malas",
        category: "Funilaria",
        quantity: 1,
        unitPrice: 480,
      },
      {
        id: "os1-i2",
        description: "Pintura do porta-malas",
        category: "Pintura",
        quantity: 1,
        unitPrice: 500,
      },
    ],
    checklist: [
      {
        id: "os1-c1",
        label: "Conferir avarias registradas na vistoria",
        done: false,
        category: "Recepção",
      },
      {
        id: "os1-c2",
        label: "Separar peças e materiais necessários",
        done: false,
        category: "Recepção",
      },
      {
        id: "os1-c3",
        label: "Reparo de lataria do porta-malas",
        done: false,
        category: "Funilaria",
      },
      { id: "os1-c4", label: "Preparação e pintura", done: false, category: "Pintura" },
      { id: "os1-c5", label: "Inspeção final e limpeza", done: false, category: "Entrega" },
    ],
    timeLogs: [],
    photos: [],
    notes: "Convertida automaticamente do orçamento ORC-2026-000117 (aprovado).",
    dueDate: "2026-06-14",
    createdAt: "2026-06-07T08:05:00-03:00",
    updatedAt: "2026-06-07T08:05:00-03:00",
  },
  {
    id: "os2",
    code: "OS-2026-000089",
    clientId: "cli-008",
    vehicleId: "vei-008",
    status: "aguardando_inicio",
    technicianId: "tec-003",
    quoteId: "q8",
    items: [
      {
        id: "os2-i1",
        description: "Reparo de amassado lateral esquerda",
        category: "Funilaria",
        quantity: 1,
        unitPrice: 1500,
      },
      {
        id: "os2-i2",
        description: "Pintura lateral esquerda",
        category: "Pintura",
        quantity: 1,
        unitPrice: 1900,
      },
      {
        id: "os2-i3",
        description: "Polimento e cristalização",
        category: "Estética",
        quantity: 1,
        unitPrice: 800,
      },
    ],
    checklist: [
      {
        id: "os2-c1",
        label: "Conferir avarias registradas na vistoria",
        done: false,
        category: "Recepção",
      },
      {
        id: "os2-c2",
        label: "Separar peças e materiais necessários",
        done: false,
        category: "Recepção",
      },
      {
        id: "os2-c3",
        label: "Reparo de lataria lateral esquerda",
        done: false,
        category: "Funilaria",
      },
      { id: "os2-c4", label: "Preparação e pintura", done: false, category: "Pintura" },
      { id: "os2-c5", label: "Polimento e cristalização", done: false, category: "Estética" },
      { id: "os2-c6", label: "Inspeção final e limpeza", done: false, category: "Entrega" },
    ],
    timeLogs: [],
    photos: [],
    notes:
      "Convertida automaticamente do orçamento ORC-2026-000116 (aprovado). Cliente solicitou prioridade.",
    dueDate: "2026-06-15",
    createdAt: "2026-06-06T09:05:00-03:00",
    updatedAt: "2026-06-06T09:05:00-03:00",
  },
  {
    id: "os3",
    code: "OS-2026-000086",
    clientId: "cli-003",
    vehicleId: "vei-013",
    status: "em_execucao",
    technicianId: "tec-001",
    items: [
      {
        id: "os3-i1",
        description: "Revisão preventiva de freios",
        category: "Mecânica",
        quantity: 1,
        unitPrice: 1200,
      },
      {
        id: "os3-i2",
        description: "Troca de pastilhas e discos",
        category: "Peças",
        quantity: 1,
        unitPrice: 2400,
      },
      {
        id: "os3-i3",
        description: "Reparo de para-lama traseiro",
        category: "Funilaria",
        quantity: 1,
        unitPrice: 1800,
      },
    ],
    checklist: [
      { id: "os3-c1", label: "Inspeção de sistema de freios", done: true, category: "Mecânica" },
      { id: "os3-c2", label: "Troca de pastilhas e discos", done: true, category: "Mecânica" },
      {
        id: "os3-c3",
        label: "Reparo de lataria - para-lama traseiro",
        done: false,
        category: "Funilaria",
      },
      { id: "os3-c4", label: "Preparação e pintura", done: false, category: "Pintura" },
      { id: "os3-c5", label: "Teste de rodagem", done: false, category: "Entrega" },
    ],
    timeLogs: [
      {
        id: "os3-t1",
        technicianId: "tec-001",
        description: "Inspeção e desmontagem do sistema de freios",
        hours: 2,
        date: "2026-06-10",
      },
      {
        id: "os3-t2",
        technicianId: "tec-001",
        description: "Substituição de pastilhas e discos",
        hours: 3,
        date: "2026-06-10",
      },
    ],
    photos: [
      {
        id: "anexo-os3-1",
        name: "antes-paralama.jpg",
        sizeLabel: "1.4 MB",
        type: "image",
        tag: "antes",
        uploadedAt: "2026-06-10T08:00:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
    ],
    notes: "Veículo de frota — cliente solicitou agilidade pois caminhão precisa retornar à rota.",
    dueDate: "2026-06-12",
    createdAt: "2026-06-09T08:00:00-03:00",
    updatedAt: "2026-06-10T17:30:00-03:00",
  },
  {
    id: "os4",
    code: "OS-2026-000085",
    clientId: "cli-011",
    vehicleId: "vei-011",
    status: "em_execucao",
    technicianId: "tec-002",
    items: [
      {
        id: "os4-i1",
        description: "Reparo de amassado porta traseira",
        category: "Funilaria",
        quantity: 1,
        unitPrice: 1100,
      },
      {
        id: "os4-i2",
        description: "Pintura da porta traseira",
        category: "Pintura",
        quantity: 1,
        unitPrice: 1350,
      },
    ],
    checklist: [
      {
        id: "os4-c1",
        label: "Conferir avarias registradas na vistoria",
        done: true,
        category: "Recepção",
      },
      {
        id: "os4-c2",
        label: "Reparo de lataria da porta traseira",
        done: true,
        category: "Funilaria",
      },
      { id: "os4-c3", label: "Preparação e pintura", done: false, category: "Pintura" },
      { id: "os4-c4", label: "Inspeção final e limpeza", done: false, category: "Entrega" },
    ],
    timeLogs: [
      {
        id: "os4-t1",
        technicianId: "tec-002",
        description: "Funilaria da porta traseira",
        hours: 4,
        date: "2026-06-09",
      },
    ],
    photos: [
      {
        id: "anexo-os4-1",
        name: "antes-porta-traseira.jpg",
        sizeLabel: "1.1 MB",
        type: "image",
        tag: "antes",
        uploadedAt: "2026-06-09T09:00:00-03:00",
        uploadedBy: "Diego Santos",
      },
    ],
    notes: "",
    dueDate: "2026-06-16",
    createdAt: "2026-06-08T10:00:00-03:00",
    updatedAt: "2026-06-09T16:00:00-03:00",
  },
  {
    id: "os5",
    code: "OS-2026-000084",
    clientId: "cli-010",
    vehicleId: "vei-010",
    status: "em_execucao",
    technicianId: "tec-001",
    items: [
      {
        id: "os5-i1",
        description: "Reparo de amassado porta dianteira esquerda",
        category: "Funilaria",
        quantity: 1,
        unitPrice: 750,
      },
      {
        id: "os5-i2",
        description: "Pintura da porta dianteira esquerda",
        category: "Pintura",
        quantity: 1,
        unitPrice: 900,
      },
      {
        id: "os5-i3",
        description: "Lavagem e enceramento",
        category: "Estética",
        quantity: 1,
        unitPrice: 150,
      },
    ],
    checklist: [
      {
        id: "os5-c1",
        label: "Conferir avarias registradas na vistoria",
        done: true,
        category: "Recepção",
      },
      {
        id: "os5-c2",
        label: "Reparo de lataria da porta dianteira",
        done: true,
        category: "Funilaria",
      },
      { id: "os5-c3", label: "Preparação e pintura", done: true, category: "Pintura" },
      { id: "os5-c4", label: "Lavagem e enceramento", done: false, category: "Estética" },
      { id: "os5-c5", label: "Inspeção final e limpeza", done: false, category: "Entrega" },
    ],
    timeLogs: [
      {
        id: "os5-t1",
        technicianId: "tec-001",
        description: "Funilaria e pintura da porta dianteira",
        hours: 5,
        date: "2026-06-10",
      },
    ],
    photos: [
      {
        id: "anexo-os5-1",
        name: "antes-porta-dianteira.jpg",
        sizeLabel: "1.2 MB",
        type: "image",
        tag: "antes",
        uploadedAt: "2026-06-10T08:30:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
      {
        id: "anexo-os5-2",
        name: "depois-porta-dianteira.jpg",
        sizeLabel: "1.3 MB",
        type: "image",
        tag: "depois",
        uploadedAt: "2026-06-11T07:00:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
    ],
    notes: "Entrega prevista para hoje às 17:30.",
    dueDate: "2026-06-11",
    createdAt: "2026-06-08T13:00:00-03:00",
    updatedAt: "2026-06-11T07:00:00-03:00",
  },
  {
    id: "os6",
    code: "OS-2026-000082",
    clientId: "cli-012",
    vehicleId: "vei-015",
    status: "aguardando_peca",
    technicianId: "tec-002",
    items: [
      {
        id: "os6-i1",
        description: "Substituição de para-choque traseiro",
        category: "Peças",
        quantity: 1,
        unitPrice: 1450,
      },
      {
        id: "os6-i2",
        description: "Pintura do para-choque traseiro",
        category: "Pintura",
        quantity: 1,
        unitPrice: 980,
      },
    ],
    checklist: [
      {
        id: "os6-c1",
        label: "Conferir avarias registradas na vistoria",
        done: true,
        category: "Recepção",
      },
      { id: "os6-c2", label: "Solicitar peça ao fornecedor", done: true, category: "Peças" },
      { id: "os6-c3", label: "Substituição do para-choque", done: false, category: "Funilaria" },
      { id: "os6-c4", label: "Preparação e pintura", done: false, category: "Pintura" },
    ],
    timeLogs: [],
    photos: [
      {
        id: "anexo-os6-1",
        name: "antes-parachoque-traseiro.jpg",
        sizeLabel: "1.0 MB",
        type: "image",
        tag: "antes",
        uploadedAt: "2026-06-09T13:30:00-03:00",
        uploadedBy: "Diego Santos",
      },
    ],
    notes: "Peça em transporte — previsão de chegada em 18/06.",
    dueDate: "2026-06-18",
    createdAt: "2026-06-09T13:00:00-03:00",
    updatedAt: "2026-06-09T14:00:00-03:00",
  },
  {
    id: "os7",
    code: "OS-2026-000080",
    clientId: "cli-009",
    vehicleId: "vei-009",
    status: "finalizado",
    technicianId: "tec-001",
    items: [
      {
        id: "os7-i1",
        description: "Reparo de para-lama dianteiro",
        category: "Funilaria",
        quantity: 1,
        unitPrice: 900,
      },
      {
        id: "os7-i2",
        description: "Pintura do para-lama dianteiro",
        category: "Pintura",
        quantity: 1,
        unitPrice: 1050,
      },
    ],
    checklist: [
      {
        id: "os7-c1",
        label: "Conferir avarias registradas na vistoria",
        done: true,
        category: "Recepção",
      },
      { id: "os7-c2", label: "Reparo de lataria do para-lama", done: true, category: "Funilaria" },
      { id: "os7-c3", label: "Preparação e pintura", done: true, category: "Pintura" },
      { id: "os7-c4", label: "Inspeção final e limpeza", done: true, category: "Entrega" },
    ],
    timeLogs: [
      {
        id: "os7-t1",
        technicianId: "tec-001",
        description: "Funilaria e pintura do para-lama dianteiro",
        hours: 6,
        date: "2026-06-10",
      },
    ],
    photos: [
      {
        id: "anexo-os7-1",
        name: "antes-paralama-dianteiro.jpg",
        sizeLabel: "1.1 MB",
        type: "image",
        tag: "antes",
        uploadedAt: "2026-06-10T08:00:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
      {
        id: "anexo-os7-2",
        name: "depois-paralama-dianteiro.jpg",
        sizeLabel: "1.2 MB",
        type: "image",
        tag: "depois",
        uploadedAt: "2026-06-11T09:30:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
    ],
    notes: "Pronto para retirada — cliente avisado, retirada prevista para hoje às 14h.",
    dueDate: "2026-06-11",
    createdAt: "2026-06-07T09:00:00-03:00",
    updatedAt: "2026-06-11T09:30:00-03:00",
  },
  {
    id: "os8",
    code: "OS-2026-000078",
    clientId: "cli-001",
    vehicleId: "vei-001",
    status: "entregue",
    technicianId: "tec-002",
    items: [
      {
        id: "os8-i1",
        description: "Troca de óleo e filtros",
        category: "Mecânica",
        quantity: 1,
        unitPrice: 320,
      },
      {
        id: "os8-i2",
        description: "Higienização interna",
        category: "Estética",
        quantity: 1,
        unitPrice: 350,
      },
    ],
    checklist: [
      { id: "os8-c1", label: "Troca de óleo e filtros", done: true, category: "Mecânica" },
      { id: "os8-c2", label: "Higienização interna", done: true, category: "Estética" },
      { id: "os8-c3", label: "Inspeção final e entrega", done: true, category: "Entrega" },
    ],
    timeLogs: [
      {
        id: "os8-t1",
        technicianId: "tec-002",
        description: "Revisão de manutenção preventiva",
        hours: 2,
        date: "2026-06-10",
      },
    ],
    photos: [],
    notes: "Serviço de manutenção preventiva — entregue ao cliente.",
    dueDate: "2026-06-10",
    createdAt: "2026-06-09T08:00:00-03:00",
    updatedAt: "2026-06-10T17:00:00-03:00",
  },
  {
    id: "os9",
    code: "OS-2026-000077",
    clientId: "cli-002",
    vehicleId: "vei-002",
    status: "entregue",
    technicianId: "tec-001",
    items: [
      {
        id: "os9-i1",
        description: "Reparo de retrovisor esquerdo",
        category: "Peças",
        quantity: 1,
        unitPrice: 480,
      },
      {
        id: "os9-i2",
        description: "Alinhamento e balanceamento",
        category: "Mecânica",
        quantity: 1,
        unitPrice: 220,
      },
    ],
    checklist: [
      { id: "os9-c1", label: "Substituição do retrovisor esquerdo", done: true, category: "Peças" },
      { id: "os9-c2", label: "Alinhamento e balanceamento", done: true, category: "Mecânica" },
      { id: "os9-c3", label: "Inspeção final e entrega", done: true, category: "Entrega" },
    ],
    timeLogs: [
      {
        id: "os9-t1",
        technicianId: "tec-001",
        description: "Substituição de retrovisor e alinhamento",
        hours: 1.5,
        date: "2026-06-09",
      },
    ],
    photos: [],
    notes: "Serviço concluído e entregue ao cliente.",
    dueDate: "2026-06-09",
    createdAt: "2026-06-08T09:00:00-03:00",
    updatedAt: "2026-06-09T16:30:00-03:00",
  },
];

export function getServiceOrderById(id: string): ServiceOrder | undefined {
  return SERVICE_ORDERS.find((order) => order.id === id);
}

export function calculateServiceOrderTotal(items: ServiceOrderItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}
