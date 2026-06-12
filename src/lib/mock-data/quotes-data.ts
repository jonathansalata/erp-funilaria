import type { Attachment } from "@/lib/mock-data/attachments";

export type QuoteStatus = "rascunho" | "enviado" | "em_negociacao" | "aprovado" | "recusado";

export type QuoteItem = {
  id: string;
  description: string;
  category: "funilaria" | "pintura" | "pecas" | "estetica" | "outros";
  quantity: number;
  unitPrice: number;
  discount?: number;
};

export type Quote = {
  id: string;
  code: string;
  clientId: string;
  vehicleId: string;
  status: QuoteStatus;
  items: QuoteItem[];
  notes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  convertedServiceOrderId?: string;
};

export const QUOTE_CATEGORY_LABELS: Record<QuoteItem["category"], string> = {
  funilaria: "Funilaria",
  pintura: "Pintura",
  pecas: "Peças",
  estetica: "Estética",
  outros: "Outros",
};

export const QUOTES: Quote[] = [
  {
    id: "q1",
    code: "ORC-2026-000124",
    clientId: "cli-001",
    vehicleId: "vei-001",
    status: "rascunho",
    items: [
      {
        id: "q1-i1",
        description: "Reparo de para-choque traseiro",
        category: "funilaria",
        quantity: 1,
        unitPrice: 850,
      },
      {
        id: "q1-i2",
        description: "Pintura do para-choque traseiro",
        category: "pintura",
        quantity: 1,
        unitPrice: 1200,
      },
      {
        id: "q1-i3",
        description: "Polimento geral",
        category: "estetica",
        quantity: 1,
        unitPrice: 400,
      },
    ],
    notes: "Cliente relatou colisão leve na traseira. Aguardando aprovação para iniciar.",
    attachments: [],
    createdAt: "2026-06-11T07:00:00-03:00",
    updatedAt: "2026-06-11T09:00:00-03:00",
    validUntil: "2026-06-21",
  },
  {
    id: "q2",
    code: "ORC-2026-000125",
    clientId: "cli-002",
    vehicleId: "vei-002",
    status: "rascunho",
    items: [
      {
        id: "q2-i1",
        description: "Substituição de para-lama dianteiro direito",
        category: "pecas",
        quantity: 1,
        unitPrice: 1890,
      },
      {
        id: "q2-i2",
        description: "Pintura do para-lama",
        category: "pintura",
        quantity: 1,
        unitPrice: 980,
      },
      {
        id: "q2-i3",
        description: "Alinhamento e balanceamento",
        category: "outros",
        quantity: 1,
        unitPrice: 220,
      },
    ],
    notes: "Orçamento ainda em elaboração — aguardando cotação da peça com fornecedor.",
    attachments: [],
    createdAt: "2026-06-11T05:30:00-03:00",
    updatedAt: "2026-06-11T07:30:00-03:00",
    validUntil: "2026-06-21",
  },
  {
    id: "q3",
    code: "ORC-2026-000122",
    clientId: "cli-003",
    vehicleId: "vei-003",
    status: "enviado",
    items: [
      {
        id: "q3-i1",
        description: "Reparo de lataria - lateral direita",
        category: "funilaria",
        quantity: 1,
        unitPrice: 4200,
      },
      {
        id: "q3-i2",
        description: "Pintura completa lateral direita",
        category: "pintura",
        quantity: 1,
        unitPrice: 5800,
      },
      {
        id: "q3-i3",
        description: "Substituição de retrovisor direito",
        category: "pecas",
        quantity: 1,
        unitPrice: 1100,
        discount: 5,
      },
      {
        id: "q3-i4",
        description: "Higienização interna",
        category: "estetica",
        quantity: 1,
        unitPrice: 1200,
      },
    ],
    notes: "Van utilizada na frota — necessidade de liberação rápida para retorno à operação.",
    attachments: [
      {
        id: "anexo-q3-1",
        name: "fotos-avaria-lateral.zip",
        sizeLabel: "4.8 MB",
        type: "other",
        tag: "geral",
        uploadedAt: "2026-06-10T16:10:00-03:00",
        uploadedBy: "Carlos Eduardo",
      },
    ],
    createdAt: "2026-06-09T10:00:00-03:00",
    updatedAt: "2026-06-10T16:00:00-03:00",
    validUntil: "2026-06-20",
  },
  {
    id: "q4",
    code: "ORC-2026-000121",
    clientId: "cli-004",
    vehicleId: "vei-004",
    status: "enviado",
    items: [
      {
        id: "q4-i1",
        description: "Reparo de amassado porta dianteira",
        category: "funilaria",
        quantity: 1,
        unitPrice: 650,
      },
      {
        id: "q4-i2",
        description: "Pintura da porta dianteira",
        category: "pintura",
        quantity: 1,
        unitPrice: 980,
      },
      {
        id: "q4-i3",
        description: "Troca de palheta de limpador",
        category: "pecas",
        quantity: 2,
        unitPrice: 75,
      },
    ],
    notes: "Vistoria concluída — itens conferem com o checklist anexo.",
    attachments: [],
    createdAt: "2026-06-10T10:30:00-03:00",
    updatedAt: "2026-06-10T11:00:00-03:00",
    validUntil: "2026-06-20",
  },
  {
    id: "q5",
    code: "ORC-2026-000120",
    clientId: "cli-005",
    vehicleId: "vei-005",
    status: "enviado",
    items: [
      {
        id: "q5-i1",
        description: "Reparo de capô amassado",
        category: "funilaria",
        quantity: 1,
        unitPrice: 2100,
      },
      {
        id: "q5-i2",
        description: "Pintura do capô",
        category: "pintura",
        quantity: 1,
        unitPrice: 1850,
      },
      {
        id: "q5-i3",
        description: "Substituição de farol esquerdo",
        category: "pecas",
        quantity: 1,
        unitPrice: 1980,
      },
      {
        id: "q5-i4",
        description: "Calibragem e revisão de suspensão",
        category: "outros",
        quantity: 1,
        unitPrice: 1490,
      },
    ],
    notes: "Gerado a partir da vistoria VIS-000010.",
    attachments: [],
    createdAt: "2026-06-09T09:00:00-03:00",
    updatedAt: "2026-06-09T10:30:00-03:00",
    validUntil: "2026-06-19",
  },
  {
    id: "q6",
    code: "ORC-2026-000118",
    clientId: "cli-006",
    vehicleId: "vei-006",
    status: "em_negociacao",
    items: [
      {
        id: "q6-i1",
        description: "Reparo de para-choque dianteiro",
        category: "funilaria",
        quantity: 1,
        unitPrice: 1100,
      },
      {
        id: "q6-i2",
        description: "Pintura do para-choque dianteiro",
        category: "pintura",
        quantity: 1,
        unitPrice: 950,
      },
      {
        id: "q6-i3",
        description: "Substituição de grade frontal",
        category: "pecas",
        quantity: 1,
        unitPrice: 480,
        discount: 10,
      },
      {
        id: "q6-i4",
        description: "Higienização interna completa",
        category: "estetica",
        quantity: 1,
        unitPrice: 350,
      },
    ],
    notes: "Cliente solicitou desconto adicional na peça — aguardando retorno do gerente.",
    attachments: [
      {
        id: "anexo-q6-1",
        name: "proposta-revisada.pdf",
        sizeLabel: "320 KB",
        type: "pdf",
        tag: "geral",
        uploadedAt: "2026-06-08T09:30:00-03:00",
        uploadedBy: "Sistema",
      },
    ],
    createdAt: "2026-06-07T08:00:00-03:00",
    updatedAt: "2026-06-08T09:15:00-03:00",
    validUntil: "2026-06-18",
  },
  {
    id: "q7",
    code: "ORC-2026-000117",
    clientId: "cli-007",
    vehicleId: "vei-007",
    status: "aprovado",
    items: [
      {
        id: "q7-i1",
        description: "Reparo de lataria - porta-malas",
        category: "funilaria",
        quantity: 1,
        unitPrice: 480,
      },
      {
        id: "q7-i2",
        description: "Pintura do porta-malas",
        category: "pintura",
        quantity: 1,
        unitPrice: 500,
      },
    ],
    notes: "Aprovado pelo cliente via telefone. Iniciar produção.",
    attachments: [],
    createdAt: "2026-06-06T11:00:00-03:00",
    updatedAt: "2026-06-07T08:00:00-03:00",
    validUntil: "2026-06-17",
    convertedServiceOrderId: "os1",
  },
  {
    id: "q8",
    code: "ORC-2026-000116",
    clientId: "cli-008",
    vehicleId: "vei-008",
    status: "aprovado",
    items: [
      {
        id: "q8-i1",
        description: "Reparo de amassado lateral esquerda",
        category: "funilaria",
        quantity: 1,
        unitPrice: 1500,
      },
      {
        id: "q8-i2",
        description: "Pintura lateral esquerda",
        category: "pintura",
        quantity: 1,
        unitPrice: 1900,
      },
      {
        id: "q8-i3",
        description: "Polimento e cristalização",
        category: "estetica",
        quantity: 1,
        unitPrice: 800,
      },
    ],
    notes: "Aprovado — cliente solicitou prioridade na entrega.",
    attachments: [],
    createdAt: "2026-06-05T13:30:00-03:00",
    updatedAt: "2026-06-06T09:00:00-03:00",
    validUntil: "2026-06-16",
    convertedServiceOrderId: "os2",
  },
  {
    id: "q9",
    code: "ORC-2026-000110",
    clientId: "cli-009",
    vehicleId: "vei-009",
    status: "recusado",
    items: [
      {
        id: "q9-i1",
        description: "Troca de para-brisa",
        category: "pecas",
        quantity: 1,
        unitPrice: 1120,
      },
    ],
    notes: "Cliente optou por seguro próprio para este reparo.",
    attachments: [],
    createdAt: "2026-06-03T10:00:00-03:00",
    updatedAt: "2026-06-04T15:00:00-03:00",
    validUntil: "2026-06-14",
  },
];

export function getQuoteById(id: string): Quote | undefined {
  return QUOTES.find((quote) => quote.id === id);
}

export function calculateQuoteTotal(items: QuoteItem[]): {
  subtotal: number;
  discountTotal: number;
  total: number;
} {
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineDiscount = item.discount ? (lineSubtotal * item.discount) / 100 : 0;
    subtotal += lineSubtotal;
    discountTotal += lineDiscount;
  }

  return { subtotal, discountTotal, total: subtotal - discountTotal };
}
