import type { StatusVariant } from "@/components/shared/status-badge";

export type JourneyStage =
  | "aguardando_vistoria"
  | "em_vistoria"
  | "aguardando_aprovacao"
  | "aguardando_inicio"
  | "em_execucao"
  | "aguardando_peca"
  | "pronto_para_retirada"
  | "entregue";

export type Vehicle = {
  id: string;
  code: string;
  clientId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  journeyStage: JourneyStage | null;
  journeyStageUpdatedAt?: string;
};

export const JOURNEY_STAGE_META: Record<JourneyStage, { label: string; variant: StatusVariant }> = {
  aguardando_vistoria: { label: "Aguardando vistoria", variant: "default" },
  em_vistoria: { label: "Em vistoria", variant: "info" },
  aguardando_aprovacao: { label: "Aguardando aprovação", variant: "warning" },
  aguardando_inicio: { label: "Aguardando início", variant: "default" },
  em_execucao: { label: "Em execução", variant: "primary" },
  aguardando_peca: { label: "Aguardando peça", variant: "warning" },
  pronto_para_retirada: { label: "Pronto para retirada", variant: "success" },
  entregue: { label: "Entregue", variant: "success" },
};

export const VEHICLES: Vehicle[] = [
  {
    id: "vei-001",
    code: "VEI-000001",
    clientId: "cli-001",
    plate: "ABC1D23",
    brand: "Honda",
    model: "Civic",
    year: 2019,
    color: "Preto",
    mileage: 68500,
    journeyStage: "aguardando_aprovacao",
    journeyStageUpdatedAt: "2026-06-11T09:00:00-03:00",
  },
  {
    id: "vei-002",
    code: "VEI-000002",
    clientId: "cli-002",
    plate: "DEF4E56",
    brand: "Fiat",
    model: "Toro",
    year: 2021,
    color: "Branco",
    mileage: 41200,
    journeyStage: "aguardando_aprovacao",
    journeyStageUpdatedAt: "2026-06-11T07:30:00-03:00",
  },
  {
    id: "vei-003",
    code: "VEI-000003",
    clientId: "cli-003",
    plate: "GHI7F89",
    brand: "Mercedes-Benz",
    model: "Sprinter",
    year: 2020,
    color: "Branco",
    mileage: 132400,
    journeyStage: "aguardando_aprovacao",
    journeyStageUpdatedAt: "2026-06-10T16:00:00-03:00",
  },
  {
    id: "vei-004",
    code: "VEI-000004",
    clientId: "cli-004",
    plate: "JKL0G12",
    brand: "Hyundai",
    model: "HB20",
    year: 2022,
    color: "Vermelho",
    mileage: 28900,
    journeyStage: "aguardando_aprovacao",
    journeyStageUpdatedAt: "2026-06-10T11:00:00-03:00",
  },
  {
    id: "vei-005",
    code: "VEI-000005",
    clientId: "cli-005",
    plate: "MNO3H45",
    brand: "Jeep",
    model: "Compass",
    year: 2018,
    color: "Cinza",
    mileage: 89700,
    journeyStage: "aguardando_aprovacao",
    journeyStageUpdatedAt: "2026-06-09T10:30:00-03:00",
  },
  {
    id: "vei-006",
    code: "VEI-000006",
    clientId: "cli-006",
    plate: "PQR6I78",
    brand: "Chevrolet",
    model: "Onix",
    year: 2020,
    color: "Prata",
    mileage: 55300,
    journeyStage: "aguardando_aprovacao",
    journeyStageUpdatedAt: "2026-06-08T09:15:00-03:00",
  },
  {
    id: "vei-007",
    code: "VEI-000007",
    clientId: "cli-007",
    plate: "STU9J01",
    brand: "Volkswagen",
    model: "Gol",
    year: 2017,
    color: "Branco",
    mileage: 112000,
    journeyStage: "em_execucao",
    journeyStageUpdatedAt: "2026-06-11T08:00:00-03:00",
  },
  {
    id: "vei-008",
    code: "VEI-000008",
    clientId: "cli-008",
    plate: "VWX2K34",
    brand: "Toyota",
    model: "Corolla",
    year: 2021,
    color: "Preto",
    mileage: 35600,
    journeyStage: "em_execucao",
    journeyStageUpdatedAt: "2026-06-11T08:00:00-03:00",
  },
  {
    id: "vei-009",
    code: "VEI-000009",
    clientId: "cli-009",
    plate: "YZA5L67",
    brand: "Renault",
    model: "Kwid",
    year: 2019,
    color: "Vermelho",
    mileage: 74300,
    journeyStage: "pronto_para_retirada",
    journeyStageUpdatedAt: "2026-06-11T10:00:00-03:00",
  },
  {
    id: "vei-010",
    code: "VEI-000010",
    clientId: "cli-010",
    plate: "BCD8M90",
    brand: "Ford",
    model: "Ka",
    year: 2020,
    color: "Branco",
    mileage: 49800,
    journeyStage: "em_execucao",
    journeyStageUpdatedAt: "2026-06-11T07:00:00-03:00",
  },
  {
    id: "vei-011",
    code: "VEI-000011",
    clientId: "cli-011",
    plate: "EFG1N23",
    brand: "Chevrolet",
    model: "Tracker",
    year: 2022,
    color: "Azul",
    mileage: 19400,
    journeyStage: "em_execucao",
    journeyStageUpdatedAt: "2026-06-10T14:30:00-03:00",
  },
  {
    id: "vei-012",
    code: "VEI-000012",
    clientId: "cli-012",
    plate: "HIJ4O56",
    brand: "Hyundai",
    model: "Creta",
    year: 2023,
    color: "Branco",
    mileage: 12100,
    journeyStage: "aguardando_vistoria",
    journeyStageUpdatedAt: "2026-06-11T08:30:00-03:00",
  },
  {
    id: "vei-013",
    code: "VEI-000013",
    clientId: "cli-003",
    plate: "KLM7P89",
    brand: "Mercedes-Benz",
    model: "Actros",
    year: 2019,
    color: "Branco",
    mileage: 198000,
    journeyStage: "em_execucao",
    journeyStageUpdatedAt: "2026-06-10T09:00:00-03:00",
  },
  {
    id: "vei-014",
    code: "VEI-000014",
    clientId: "cli-008",
    plate: "NOP0Q12",
    brand: "Toyota",
    model: "Hilux",
    year: 2020,
    color: "Cinza",
    mileage: 81200,
    journeyStage: "em_vistoria",
    journeyStageUpdatedAt: "2026-06-11T09:45:00-03:00",
  },
  {
    id: "vei-015",
    code: "VEI-000015",
    clientId: "cli-012",
    plate: "QRS3R45",
    brand: "Fiat",
    model: "Strada",
    year: 2021,
    color: "Branco",
    mileage: 63500,
    journeyStage: "aguardando_peca",
    journeyStageUpdatedAt: "2026-06-09T13:00:00-03:00",
  },
];

export function getVehicleById(id: string): Vehicle | undefined {
  return VEHICLES.find((vehicle) => vehicle.id === id);
}

export function getVehicleLabel(vehicle: Vehicle): string {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
}

export function getVehicleLabelById(id: string): string {
  const vehicle = getVehicleById(id);
  return vehicle ? getVehicleLabel(vehicle) : "Veículo não encontrado";
}
