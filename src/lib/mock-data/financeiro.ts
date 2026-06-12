import type { StatusVariant } from "@/components/shared/status-badge";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";

/**
 * Dados mockados do módulo Financeiro (Contas a Receber, Contas a Pagar, Fluxo de Caixa e
 * DRE Gerencial). Nesta fase os lançamentos são estáticos/derivados em memória — sem
 * integração bancária ou fiscal real (ver AGENTS.md, Fase 2A).
 */

export type ReceivableStatus = "aberto" | "parcial" | "recebido" | "cancelado";

export type Receivable = {
  id: string;
  code: string;
  clientId: string;
  document: string;
  description?: string;
  value: number;
  receivedValue?: number;
  dueDate: string;
  receivedAt?: string;
  status: ReceivableStatus;
  serviceOrderId?: string;
  quoteId?: string;
  createdAt: string;
  updatedAt: string;
};

export const RECEIVABLE_STATUS_META: Record<
  ReceivableStatus,
  { label: string; variant: StatusVariant }
> = {
  aberto: { label: "Aberto", variant: "warning" },
  parcial: { label: "Parcial", variant: "info" },
  recebido: { label: "Recebido", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

export const RECEIVABLES: Receivable[] = [
  {
    id: "rec-001",
    code: "REC-000001",
    clientId: "cli-007",
    document: "ORC-2026-000117",
    description: "Reparo de para-choque e amassado lateral",
    value: 2350,
    dueDate: "2026-06-15",
    status: "aberto",
    quoteId: "q7",
    serviceOrderId: "os1",
    createdAt: "2026-06-07T08:05:00-03:00",
    updatedAt: "2026-06-07T08:05:00-03:00",
  },
  {
    id: "rec-002",
    code: "REC-000002",
    clientId: "cli-008",
    document: "ORC-2026-000116",
    description: "Pintura geral e polimento",
    value: 4180,
    dueDate: "2026-06-14",
    status: "aberto",
    quoteId: "q8",
    serviceOrderId: "os2",
    createdAt: "2026-06-06T09:05:00-03:00",
    updatedAt: "2026-06-06T09:05:00-03:00",
  },
  {
    id: "rec-003",
    code: "REC-000003",
    clientId: "cli-001",
    document: "OS-2026-000078",
    description: "Manutenção preventiva concluída",
    value: 1280,
    dueDate: "2026-06-05",
    status: "recebido",
    receivedValue: 1280,
    receivedAt: "2026-06-05T16:00:00-03:00",
    serviceOrderId: "os8",
    createdAt: "2026-06-09T08:00:00-03:00",
    updatedAt: "2026-06-05T16:00:00-03:00",
  },
  {
    id: "rec-004",
    code: "REC-000004",
    clientId: "cli-002",
    document: "OS-2026-000077",
    description: "Reparo de retrovisor e alinhamento",
    value: 980,
    receivedValue: 480,
    dueDate: "2026-06-03",
    status: "parcial",
    serviceOrderId: "os9",
    createdAt: "2026-06-08T09:00:00-03:00",
    updatedAt: "2026-06-09T11:00:00-03:00",
  },
  {
    id: "rec-005",
    code: "REC-000005",
    clientId: "cli-009",
    document: "OS-2026-000080",
    description: "Reparo de para-lama dianteiro",
    value: 1650,
    dueDate: "2026-06-08",
    status: "aberto",
    serviceOrderId: "os7",
    createdAt: "2026-06-07T09:00:00-03:00",
    updatedAt: "2026-06-07T09:00:00-03:00",
  },
  {
    id: "rec-006",
    code: "REC-000006",
    clientId: "cli-010",
    document: "OS-2026-000084",
    description: "Reparo de porta dianteira esquerda",
    value: 2890,
    dueDate: "2026-06-11",
    status: "aberto",
    serviceOrderId: "os5",
    createdAt: "2026-06-08T13:00:00-03:00",
    updatedAt: "2026-06-08T13:00:00-03:00",
  },
  {
    id: "rec-007",
    code: "REC-000007",
    clientId: "cli-011",
    document: "OS-2026-000085",
    description: "Reparo de porta traseira",
    value: 3120,
    dueDate: "2026-06-20",
    status: "aberto",
    serviceOrderId: "os4",
    createdAt: "2026-06-08T10:00:00-03:00",
    updatedAt: "2026-06-08T10:00:00-03:00",
  },
  {
    id: "rec-008",
    code: "REC-000008",
    clientId: "cli-003",
    document: "OS-2026-000086",
    description: "Revisão preventiva e reparo de para-lama",
    value: 5450,
    dueDate: "2026-06-25",
    status: "aberto",
    serviceOrderId: "os3",
    createdAt: "2026-06-09T08:00:00-03:00",
    updatedAt: "2026-06-09T08:00:00-03:00",
  },
  {
    id: "rec-009",
    code: "REC-000009",
    clientId: "cli-012",
    document: "OS-2026-000082",
    description: "Substituição de para-choque traseiro",
    value: 1740,
    dueDate: "2026-06-07",
    status: "aberto",
    serviceOrderId: "os6",
    createdAt: "2026-06-09T13:00:00-03:00",
    updatedAt: "2026-06-09T13:00:00-03:00",
  },
  {
    id: "rec-010",
    code: "REC-000010",
    clientId: "cli-004",
    document: "ORC-2026-000119",
    description: "Orçamento recusado pelo cliente (sinistro via seguradora)",
    value: 2200,
    dueDate: "2026-06-30",
    status: "cancelado",
    createdAt: "2026-06-02T10:00:00-03:00",
    updatedAt: "2026-06-03T10:00:00-03:00",
  },
  {
    id: "rec-011",
    code: "REC-000011",
    clientId: "cli-005",
    document: "OS-2026-000070",
    description: "Troca de para-brisa e calibragem",
    value: 1390,
    dueDate: "2026-06-02",
    status: "recebido",
    receivedValue: 1390,
    receivedAt: "2026-06-02T15:00:00-03:00",
    createdAt: "2026-05-28T10:00:00-03:00",
    updatedAt: "2026-06-02T15:00:00-03:00",
  },
  {
    id: "rec-012",
    code: "REC-000012",
    clientId: "cli-006",
    document: "OS-2026-000072",
    description: "Higienização e revisão de freios",
    value: 860,
    dueDate: "2026-06-28",
    status: "aberto",
    createdAt: "2026-06-04T10:00:00-03:00",
    updatedAt: "2026-06-04T10:00:00-03:00",
  },
];

export type PayableCategory =
  | "fornecedores"
  | "salarios"
  | "aluguel"
  | "utilidades"
  | "impostos"
  | "manutencao"
  | "outros";

export const PAYABLE_CATEGORY_LABELS: Record<PayableCategory, string> = {
  fornecedores: "Fornecedores",
  salarios: "Salários",
  aluguel: "Aluguel",
  utilidades: "Utilidades",
  impostos: "Impostos",
  manutencao: "Manutenção",
  outros: "Outros",
};

export type PayableStatus = "aberto" | "pago" | "cancelado";

export const PAYABLE_STATUS_META: Record<PayableStatus, { label: string; variant: StatusVariant }> =
  {
    aberto: { label: "Aberto", variant: "warning" },
    pago: { label: "Pago", variant: "success" },
    cancelado: { label: "Cancelado", variant: "destructive" },
  };

export type Payable = {
  id: string;
  code: string;
  supplier: string;
  category: PayableCategory;
  description?: string;
  value: number;
  dueDate: string;
  paidAt?: string;
  status: PayableStatus;
  createdAt: string;
  updatedAt: string;
};

export const PAYABLES: Payable[] = [
  {
    id: "pay-001",
    code: "PAG-000001",
    supplier: "AutoPeças Distribuidora LTDA",
    category: "fornecedores",
    description: "Peças para reparo de funilaria (lote junho)",
    value: 6200,
    dueDate: "2026-06-12",
    status: "aberto",
    createdAt: "2026-06-05T10:00:00-03:00",
    updatedAt: "2026-06-05T10:00:00-03:00",
  },
  {
    id: "pay-002",
    code: "PAG-000002",
    supplier: "Folha de pagamento",
    category: "salarios",
    description: "Salários e encargos — equipe técnica",
    value: 18500,
    dueDate: "2026-06-05",
    status: "pago",
    paidAt: "2026-06-05T09:00:00-03:00",
    createdAt: "2026-05-30T10:00:00-03:00",
    updatedAt: "2026-06-05T09:00:00-03:00",
  },
  {
    id: "pay-003",
    code: "PAG-000003",
    supplier: "Imobiliária Centro",
    category: "aluguel",
    description: "Aluguel do galpão — junho/2026",
    value: 7800,
    dueDate: "2026-06-10",
    status: "pago",
    paidAt: "2026-06-09T14:00:00-03:00",
    createdAt: "2026-06-01T10:00:00-03:00",
    updatedAt: "2026-06-09T14:00:00-03:00",
  },
  {
    id: "pay-004",
    code: "PAG-000004",
    supplier: "Companhia de Energia",
    category: "utilidades",
    description: "Conta de energia elétrica",
    value: 1450,
    dueDate: "2026-06-08",
    status: "aberto",
    createdAt: "2026-06-01T10:00:00-03:00",
    updatedAt: "2026-06-01T10:00:00-03:00",
  },
  {
    id: "pay-005",
    code: "PAG-000005",
    supplier: "Companhia de Água e Esgoto",
    category: "utilidades",
    description: "Conta de água",
    value: 320,
    dueDate: "2026-06-09",
    status: "aberto",
    createdAt: "2026-06-01T10:00:00-03:00",
    updatedAt: "2026-06-01T10:00:00-03:00",
  },
  {
    id: "pay-006",
    code: "PAG-000006",
    supplier: "Receita Federal",
    category: "impostos",
    description: "DAS — Simples Nacional",
    value: 2980,
    dueDate: "2026-06-20",
    status: "aberto",
    createdAt: "2026-06-01T10:00:00-03:00",
    updatedAt: "2026-06-01T10:00:00-03:00",
  },
  {
    id: "pay-007",
    code: "PAG-000007",
    supplier: "Tintas & Vernizes Premium",
    category: "fornecedores",
    description: "Reposição de estoque de tintas",
    value: 3450,
    dueDate: "2026-06-18",
    status: "aberto",
    createdAt: "2026-06-04T10:00:00-03:00",
    updatedAt: "2026-06-04T10:00:00-03:00",
  },
  {
    id: "pay-008",
    code: "PAG-000008",
    supplier: "Oficina Mecânica Parceira",
    category: "manutencao",
    description: "Manutenção do compressor e elevadores",
    value: 1100,
    dueDate: "2026-06-06",
    status: "aberto",
    createdAt: "2026-06-01T10:00:00-03:00",
    updatedAt: "2026-06-01T10:00:00-03:00",
  },
  {
    id: "pay-009",
    code: "PAG-000009",
    supplier: "Provedora de Internet",
    category: "utilidades",
    description: "Internet e telefonia — junho/2026",
    value: 380,
    dueDate: "2026-06-15",
    status: "aberto",
    createdAt: "2026-06-04T10:00:00-03:00",
    updatedAt: "2026-06-04T10:00:00-03:00",
  },
  {
    id: "pay-010",
    code: "PAG-000010",
    supplier: "Distribuidora de EPIs",
    category: "outros",
    description: "Equipamentos de proteção individual",
    value: 640,
    dueDate: "2026-06-30",
    status: "cancelado",
    createdAt: "2026-06-02T10:00:00-03:00",
    updatedAt: "2026-06-03T10:00:00-03:00",
  },
];

export function getReceivableById(id: string): Receivable | undefined {
  return RECEIVABLES.find((item) => item.id === id);
}

export function getPayableById(id: string): Payable | undefined {
  return PAYABLES.find((item) => item.id === id);
}

export function isOverdue(dueDate: string, status: string, openStatus: string): boolean {
  return status === openStatus && dueDate < REFERENCE_DATE;
}

export type FinancialSummaryCard = {
  title: string;
  value: string;
  description: string;
};

const currentMonthPrefix = REFERENCE_DATE.slice(0, 7);

export function getReceivablesSummary(receivables: Receivable[]) {
  const totalAberto = receivables
    .filter((item) => item.status === "aberto" || item.status === "parcial")
    .reduce((sum, item) => sum + (item.value - (item.receivedValue ?? 0)), 0);

  const recebidoNoMes = receivables
    .filter((item) => item.receivedAt?.startsWith(currentMonthPrefix))
    .reduce((sum, item) => sum + (item.receivedValue ?? 0), 0);

  const atrasados = receivables.filter((item) => isOverdue(item.dueDate, item.status, "aberto"));

  return {
    totalAberto,
    recebidoNoMes,
    atrasadosCount: atrasados.length,
    atrasadosValue: atrasados.reduce(
      (sum, item) => sum + (item.value - (item.receivedValue ?? 0)),
      0,
    ),
  };
}

export function getPayablesSummary(payables: Payable[]) {
  const totalAberto = payables
    .filter((item) => item.status === "aberto")
    .reduce((sum, item) => sum + item.value, 0);

  const pagoNoMes = payables
    .filter((item) => item.paidAt?.startsWith(currentMonthPrefix))
    .reduce((sum, item) => sum + item.value, 0);

  const vencidos = payables.filter((item) => isOverdue(item.dueDate, item.status, "aberto"));

  return {
    totalAberto,
    pagoNoMes,
    vencidosCount: vencidos.length,
    vencidosValue: vencidos.reduce((sum, item) => sum + item.value, 0),
  };
}

export type CashFlowEntry = {
  date: string;
  inflow: number;
  outflow: number;
  dailyBalance: number;
  accumulatedBalance: number;
};

/** Gera o fluxo de caixa diário a partir dos lançamentos de Contas a Receber/Pagar. */
export function getCashFlowEntries(
  receivables: Receivable[],
  payables: Payable[],
  initialBalance = 0,
): CashFlowEntry[] {
  const byDate = new Map<string, { inflow: number; outflow: number }>();

  for (const receivable of receivables) {
    if (receivable.status === "cancelado") continue;
    const date = receivable.receivedAt?.slice(0, 10) ?? receivable.dueDate;
    const amount = receivable.receivedValue ?? receivable.value;
    const entry = byDate.get(date) ?? { inflow: 0, outflow: 0 };
    entry.inflow += amount;
    byDate.set(date, entry);
  }

  for (const payable of payables) {
    if (payable.status === "cancelado") continue;
    const date = payable.paidAt?.slice(0, 10) ?? payable.dueDate;
    const entry = byDate.get(date) ?? { inflow: 0, outflow: 0 };
    entry.outflow += payable.value;
    byDate.set(date, entry);
  }

  const dates = [...byDate.keys()].sort();
  let accumulated = initialBalance;

  return dates.map((date) => {
    const { inflow, outflow } = byDate.get(date)!;
    const dailyBalance = inflow - outflow;
    accumulated += dailyBalance;
    return { date, inflow, outflow, dailyBalance, accumulatedBalance: accumulated };
  });
}

export type MonthlyRevenuePoint = {
  month: string;
  receita: number;
  despesas: number;
};

/** Série mockada de faturamento x despesas para o gráfico do Dashboard Gerencial. */
export const MONTHLY_REVENUE_TREND: MonthlyRevenuePoint[] = [
  { month: "Jan", receita: 58200, despesas: 41300 },
  { month: "Fev", receita: 61500, despesas: 43800 },
  { month: "Mar", receita: 67900, despesas: 45200 },
  { month: "Abr", receita: 72400, despesas: 47600 },
  { month: "Mai", receita: 79100, despesas: 49500 },
  { month: "Jun", receita: 84300, despesas: 51200 },
];

export type DreSummary = {
  receitaBruta: number;
  custos: number;
  despesas: number;
  resultadoOperacional: number;
  lucro: number;
};

const COST_CATEGORIES: PayableCategory[] = ["fornecedores", "manutencao"];

/** Calcula o DRE Gerencial simplificado a partir das contas do período informado (YYYY-MM). */
export function getDreSummary(
  receivables: Receivable[],
  payables: Payable[],
  monthPrefix: string,
): DreSummary {
  const receitaBruta = receivables
    .filter((item) => item.status !== "cancelado" && item.dueDate.startsWith(monthPrefix))
    .reduce((sum, item) => sum + item.value, 0);

  const periodPayables = payables.filter(
    (item) => item.status !== "cancelado" && item.dueDate.startsWith(monthPrefix),
  );

  const custos = periodPayables
    .filter((item) => COST_CATEGORIES.includes(item.category))
    .reduce((sum, item) => sum + item.value, 0);

  const despesas = periodPayables
    .filter((item) => !COST_CATEGORIES.includes(item.category))
    .reduce((sum, item) => sum + item.value, 0);

  const resultadoOperacional = receitaBruta - custos;
  const lucro = resultadoOperacional - despesas;

  return { receitaBruta, custos, despesas, resultadoOperacional, lucro };
}
