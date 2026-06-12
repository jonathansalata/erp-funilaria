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

export type VehicleStatus = "ativo" | "inativo";

export type FuelType = "flex" | "gasolina" | "etanol" | "diesel" | "eletrico" | "hibrido" | "gnv";

export type Vehicle = {
  id: string;
  code: string;
  clientId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassi?: string;
  renavam?: string;
  fuel?: FuelType;
  mileage: number;
  status: VehicleStatus;
  journeyStage: JourneyStage | null;
  journeyStageUpdatedAt?: string;
  notes?: string;
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

export const VEHICLE_STATUS_META: Record<VehicleStatus, { label: string; variant: StatusVariant }> =
  {
    ativo: { label: "Ativo", variant: "success" },
    inativo: { label: "Inativo", variant: "default" },
  };

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  flex: "Flex",
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  eletrico: "Elétrico",
  hibrido: "Híbrido",
  gnv: "GNV",
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
    chassi: "9BWZZZ377VT004251",
    renavam: "00123456789",
    fuel: "flex",
    mileage: 68500,
    status: "ativo",
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
    chassi: "9BD15806AL1234567",
    renavam: "00234567890",
    fuel: "diesel",
    mileage: 41200,
    status: "ativo",
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
    chassi: "8AC9036651A234567",
    renavam: "00345678901",
    fuel: "diesel",
    mileage: 132400,
    status: "ativo",
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
    chassi: "9BHBH51EADP123456",
    renavam: "00456789012",
    fuel: "flex",
    mileage: 28900,
    status: "ativo",
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
    chassi: "988BL6CV0JM123456",
    renavam: "00567890123",
    fuel: "flex",
    mileage: 89700,
    status: "ativo",
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
    chassi: "9BGKS48U0LG123456",
    renavam: "00678901234",
    fuel: "flex",
    mileage: 55300,
    status: "ativo",
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
    chassi: "9BWAB05U5HP123456",
    renavam: "00789012345",
    fuel: "flex",
    mileage: 112000,
    status: "ativo",
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
    chassi: "9BRBL3HE5M5123456",
    renavam: "00890123456",
    fuel: "flex",
    mileage: 35600,
    status: "ativo",
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
    chassi: "93Y5SR6V0K1234567",
    renavam: "00901234567",
    fuel: "flex",
    mileage: 74300,
    status: "ativo",
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
    chassi: "9BFZF55B0LB123456",
    renavam: "01012345678",
    fuel: "flex",
    mileage: 49800,
    status: "ativo",
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
    chassi: "9BGKE48U0NG123456",
    renavam: "01123456789",
    fuel: "flex",
    mileage: 19400,
    status: "ativo",
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
    chassi: "9BHCH51EAPP123456",
    renavam: "01234567890",
    fuel: "flex",
    mileage: 12100,
    status: "ativo",
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
    chassi: "9BM694019KB123456",
    renavam: "01345678901",
    fuel: "diesel",
    mileage: 198000,
    status: "ativo",
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
    chassi: "8AJDB8CD9L1234567",
    renavam: "01456789012",
    fuel: "diesel",
    mileage: 81200,
    status: "ativo",
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
    chassi: "9BD5818A0M1234567",
    renavam: "01567890123",
    fuel: "flex",
    mileage: 63500,
    status: "ativo",
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
