import type { Attachment } from "@/lib/mock-data/attachments";
import type { StatusVariant } from "@/components/shared/status-badge";
import type { ChecklistItem } from "@/lib/mock-data/service-orders-data";

export type InspectionStatus = "pendente" | "em_andamento" | "concluida";

export const INSPECTION_STATUS_META: Record<
  InspectionStatus,
  { title: string; variant: StatusVariant }
> = {
  pendente: { title: "Pendente", variant: "default" },
  em_andamento: { title: "Em andamento", variant: "info" },
  concluida: { title: "Concluída", variant: "success" },
};

export type DamagePoint = {
  id: string;
  x: number;
  y: number;
  severity: "leve" | "moderado" | "grave";
  description: string;
  view: "frente" | "traseira" | "lateral_esquerda" | "lateral_direita" | "topo";
};

export type Inspection = {
  id: string;
  code: string;
  clientId: string;
  vehicleId: string;
  status: InspectionStatus;
  mileage: number;
  fuelLevel: number;
  checklist: ChecklistItem[];
  damagePoints: DamagePoint[];
  photos: Attachment[];
  notes?: string;
  convertedQuoteId?: string;
  createdAt: string;
  updatedAt: string;
};

export const INSPECTION_CHECKLIST_TEMPLATE: Omit<ChecklistItem, "id">[] = [
  { label: "Lataria sem avarias visíveis", done: false, category: "Lataria" },
  { label: "Pintura sem riscos ou descascamentos", done: false, category: "Pintura" },
  { label: "Pneus com desgaste dentro do limite", done: false, category: "Pneus" },
  { label: "Estepe presente e calibrado", done: false, category: "Pneus" },
  { label: "Estofados e bancos sem manchas/rasgos", done: false, category: "Interior" },
  { label: "Painel e comandos funcionando", done: false, category: "Interior" },
  { label: "Faróis e lanternas funcionando", done: false, category: "Elétrica" },
  { label: "Bateria sem sinais de oxidação", done: false, category: "Elétrica" },
];

export const INSPECTIONS: Inspection[] = [
  {
    id: "vis-001",
    code: "VIS-000012",
    clientId: "cli-012",
    vehicleId: "vei-012",
    status: "pendente",
    mileage: 12100,
    fuelLevel: 60,
    checklist: INSPECTION_CHECKLIST_TEMPLATE.map((item, index) => ({
      id: `vis001-c${index + 1}`,
      ...item,
    })),
    damagePoints: [],
    photos: [],
    notes: "Veículo aguardando início da vistoria de recepção.",
    createdAt: "2026-06-11T08:30:00-03:00",
    updatedAt: "2026-06-11T08:30:00-03:00",
  },
  {
    id: "vis-002",
    code: "VIS-000011",
    clientId: "cli-008",
    vehicleId: "vei-014",
    status: "em_andamento",
    mileage: 81200,
    fuelLevel: 35,
    checklist: [
      { id: "vis002-c1", label: "Lataria sem avarias visíveis", done: false, category: "Lataria" },
      {
        id: "vis002-c2",
        label: "Pintura sem riscos ou descascamentos",
        done: false,
        category: "Pintura",
      },
      {
        id: "vis002-c3",
        label: "Pneus com desgaste dentro do limite",
        done: true,
        category: "Pneus",
      },
      { id: "vis002-c4", label: "Estepe presente e calibrado", done: true, category: "Pneus" },
      {
        id: "vis002-c5",
        label: "Estofados e bancos sem manchas/rasgos",
        done: true,
        category: "Interior",
      },
      { id: "vis002-c6", label: "Painel e comandos funcionando", done: true, category: "Interior" },
      {
        id: "vis002-c7",
        label: "Faróis e lanternas funcionando",
        done: false,
        category: "Elétrica",
      },
      {
        id: "vis002-c8",
        label: "Bateria sem sinais de oxidação",
        done: false,
        category: "Elétrica",
      },
    ],
    damagePoints: [
      {
        id: "vis002-d1",
        x: 22,
        y: 48,
        severity: "moderado",
        description: "Amassado na porta traseira esquerda",
        view: "lateral_esquerda",
      },
      {
        id: "vis002-d2",
        x: 78,
        y: 30,
        severity: "leve",
        description: "Risco superficial no para-lama traseiro direito",
        view: "lateral_direita",
      },
    ],
    photos: [],
    notes: "Vistoria em andamento — falta concluir checklist elétrico.",
    createdAt: "2026-06-11T09:45:00-03:00",
    updatedAt: "2026-06-11T10:15:00-03:00",
  },
  {
    id: "vis-003",
    code: "VIS-000010",
    clientId: "cli-005",
    vehicleId: "vei-005",
    status: "concluida",
    mileage: 89700,
    fuelLevel: 50,
    checklist: INSPECTION_CHECKLIST_TEMPLATE.map((item, index) => ({
      id: `vis003-c${index + 1}`,
      ...item,
      done: true,
    })),
    damagePoints: [
      {
        id: "vis003-d1",
        x: 50,
        y: 12,
        severity: "grave",
        description: "Capô amassado por impacto frontal",
        view: "frente",
      },
      {
        id: "vis003-d2",
        x: 30,
        y: 15,
        severity: "moderado",
        description: "Farol esquerdo trincado",
        view: "frente",
      },
    ],
    photos: [
      {
        id: "anexo-vis003-1",
        name: "capo-amassado.jpg",
        sizeLabel: "1.5 MB",
        type: "image",
        tag: "geral",
        uploadedAt: "2026-06-09T09:15:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
    ],
    notes: "Vistoria concluída — gerado orçamento ORC-2026-000120.",
    convertedQuoteId: "q5",
    createdAt: "2026-06-09T08:30:00-03:00",
    updatedAt: "2026-06-09T09:30:00-03:00",
  },
  {
    id: "vis-004",
    code: "VIS-000009",
    clientId: "cli-006",
    vehicleId: "vei-006",
    status: "concluida",
    mileage: 55300,
    fuelLevel: 80,
    checklist: INSPECTION_CHECKLIST_TEMPLATE.map((item, index) => ({
      id: `vis004-c${index + 1}`,
      ...item,
      done: true,
    })),
    damagePoints: [
      {
        id: "vis004-d1",
        x: 50,
        y: 88,
        severity: "moderado",
        description: "Para-choque dianteiro com trincas",
        view: "frente",
      },
      {
        id: "vis004-d2",
        x: 50,
        y: 95,
        severity: "leve",
        description: "Grade frontal com peça quebrada",
        view: "frente",
      },
    ],
    photos: [
      {
        id: "anexo-vis004-1",
        name: "parachoque-dianteiro.jpg",
        sizeLabel: "1.3 MB",
        type: "image",
        tag: "geral",
        uploadedAt: "2026-06-07T08:15:00-03:00",
        uploadedBy: "Diego Santos",
      },
    ],
    notes: "Vistoria concluída — gerado orçamento ORC-2026-000118.",
    convertedQuoteId: "q6",
    createdAt: "2026-06-07T07:30:00-03:00",
    updatedAt: "2026-06-07T08:30:00-03:00",
  },
  {
    id: "vis-005",
    code: "VIS-000008",
    clientId: "cli-004",
    vehicleId: "vei-004",
    status: "concluida",
    mileage: 28900,
    fuelLevel: 70,
    checklist: INSPECTION_CHECKLIST_TEMPLATE.map((item, index) => ({
      id: `vis005-c${index + 1}`,
      ...item,
      done: true,
    })),
    damagePoints: [
      {
        id: "vis005-d1",
        x: 18,
        y: 45,
        severity: "leve",
        description: "Amassado leve na porta dianteira",
        view: "lateral_esquerda",
      },
    ],
    photos: [],
    notes: "Vistoria concluída — gerado orçamento ORC-2026-000121.",
    convertedQuoteId: "q4",
    createdAt: "2026-06-10T10:00:00-03:00",
    updatedAt: "2026-06-10T10:30:00-03:00",
  },
];

export function getInspectionById(id: string): Inspection | undefined {
  return INSPECTIONS.find((inspection) => inspection.id === id);
}

export function getInspectionsForVehicle(vehicleId: string): Inspection[] {
  return INSPECTIONS.filter((inspection) => inspection.vehicleId === vehicleId);
}
