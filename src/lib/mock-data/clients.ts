import type { StatusVariant } from "@/components/shared/status-badge";

export type ClientType = "pessoa_fisica" | "pessoa_juridica";
export type ClientStatus = "ativo" | "inativo" | "bloqueado";

export type Client = {
  id: string;
  code: string;
  /** Nome completo (PF) ou Razão social (PJ). */
  name: string;
  type: ClientType;
  /** CPF (PF) ou CNPJ (PJ). */
  document: string;
  status: ClientStatus;
  phone: string;
  whatsapp?: string;
  email: string;
  /** Endereço completo (compatibilidade/exibição). */
  address: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  /** Pessoa física. */
  rg?: string;
  birthDate?: string;
  /** Pessoa jurídica. */
  fantasyName?: string;
  stateRegistration?: string;
  responsibleName?: string;
  vehicleIds: string[];
  createdAt: string;
  notes?: string;
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  pessoa_fisica: "Pessoa física",
  pessoa_juridica: "Pessoa jurídica",
};

export const CLIENT_STATUS_META: Record<ClientStatus, { label: string; variant: StatusVariant }> = {
  ativo: { label: "Ativo", variant: "success" },
  inativo: { label: "Inativo", variant: "default" },
  bloqueado: { label: "Bloqueado", variant: "destructive" },
};

export const CLIENTS: Client[] = [
  {
    id: "cli-001",
    code: "CLI-000001",
    name: "Mariana Costa",
    type: "pessoa_fisica",
    document: "123.456.789-01",
    status: "ativo",
    phone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    email: "mariana.costa@email.com",
    address: "Rua das Acácias, 120 - São Paulo, SP",
    vehicleIds: ["vei-001"],
    createdAt: "2025-02-10T09:00:00-03:00",
  },
  {
    id: "cli-002",
    code: "CLI-000002",
    name: "Pedro Henrique Lima",
    type: "pessoa_fisica",
    document: "234.567.890-12",
    status: "ativo",
    phone: "(11) 97654-3210",
    whatsapp: "(11) 97654-3210",
    email: "pedro.lima@email.com",
    address: "Av. Paulista, 1500 - São Paulo, SP",
    vehicleIds: ["vei-002"],
    createdAt: "2025-03-22T14:30:00-03:00",
  },
  {
    id: "cli-003",
    code: "CLI-000003",
    name: "Transnorte Transportes LTDA",
    type: "pessoa_juridica",
    document: "12.345.678/0001-90",
    status: "ativo",
    phone: "(11) 3456-7890",
    email: "frota@transnorte.com.br",
    address: "Rod. Anhanguera, km 32 - Cajamar, SP",
    fantasyName: "Transnorte",
    stateRegistration: "123.456.789.110",
    responsibleName: "Carlos Eduardo Mendes",
    vehicleIds: ["vei-003", "vei-013"],
    createdAt: "2024-11-05T10:00:00-03:00",
    notes: "Cliente frota — prioridade em manutenções preventivas.",
  },
  {
    id: "cli-004",
    code: "CLI-000004",
    name: "Carla Souza",
    type: "pessoa_fisica",
    document: "345.678.901-23",
    status: "ativo",
    phone: "(11) 96543-2109",
    whatsapp: "(11) 96543-2109",
    email: "carla.souza@email.com",
    address: "Rua dos Pinheiros, 540 - São Paulo, SP",
    vehicleIds: ["vei-004"],
    createdAt: "2025-05-14T11:15:00-03:00",
  },
  {
    id: "cli-005",
    code: "CLI-000005",
    name: "Roberto Almeida",
    type: "pessoa_fisica",
    document: "456.789.012-34",
    status: "ativo",
    phone: "(11) 95432-1098",
    whatsapp: "(11) 95432-1098",
    email: "roberto.almeida@email.com",
    address: "Alameda Santos, 880 - São Paulo, SP",
    vehicleIds: ["vei-005"],
    createdAt: "2025-01-30T16:45:00-03:00",
  },
  {
    id: "cli-006",
    code: "CLI-000006",
    name: "Fernanda Ribeiro",
    type: "pessoa_fisica",
    document: "567.890.123-45",
    status: "ativo",
    phone: "(11) 94321-0987",
    whatsapp: "(11) 94321-0987",
    email: "fernanda.ribeiro@email.com",
    address: "Rua Augusta, 2200 - São Paulo, SP",
    vehicleIds: ["vei-006"],
    createdAt: "2025-04-02T08:20:00-03:00",
  },
  {
    id: "cli-007",
    code: "CLI-000007",
    name: "Lucas Martins",
    type: "pessoa_fisica",
    document: "678.901.234-56",
    status: "ativo",
    phone: "(11) 93210-9876",
    whatsapp: "(11) 93210-9876",
    email: "lucas.martins@email.com",
    address: "Rua Vergueiro, 980 - São Paulo, SP",
    vehicleIds: ["vei-007"],
    createdAt: "2025-06-18T13:00:00-03:00",
  },
  {
    id: "cli-008",
    code: "CLI-000008",
    name: "Juliana Pereira",
    type: "pessoa_fisica",
    document: "789.012.345-67",
    status: "ativo",
    phone: "(11) 92109-8765",
    whatsapp: "(11) 92109-8765",
    email: "juliana.pereira@email.com",
    address: "Rua Oscar Freire, 410 - São Paulo, SP",
    vehicleIds: ["vei-008", "vei-014"],
    createdAt: "2024-12-12T09:30:00-03:00",
  },
  {
    id: "cli-009",
    code: "CLI-000009",
    name: "Anderson Dias",
    type: "pessoa_fisica",
    document: "890.123.456-78",
    status: "ativo",
    phone: "(11) 91098-7654",
    whatsapp: "(11) 91098-7654",
    email: "anderson.dias@email.com",
    address: "Rua Domingos de Morais, 670 - São Paulo, SP",
    vehicleIds: ["vei-009"],
    createdAt: "2025-07-09T15:50:00-03:00",
  },
  {
    id: "cli-010",
    code: "CLI-000010",
    name: "Bruna Tavares",
    type: "pessoa_fisica",
    document: "901.234.567-89",
    status: "ativo",
    phone: "(11) 90987-6543",
    whatsapp: "(11) 90987-6543",
    email: "bruna.tavares@email.com",
    address: "Rua Teodoro Sampaio, 1330 - São Paulo, SP",
    vehicleIds: ["vei-010"],
    createdAt: "2025-08-25T10:10:00-03:00",
  },
  {
    id: "cli-011",
    code: "CLI-000011",
    name: "Marcos Vinicius Andrade",
    type: "pessoa_fisica",
    document: "012.345.678-90",
    status: "ativo",
    phone: "(11) 99887-6655",
    whatsapp: "(11) 99887-6655",
    email: "marcos.andrade@email.com",
    address: "Av. Rebouças, 2100 - São Paulo, SP",
    vehicleIds: ["vei-011"],
    createdAt: "2025-09-01T12:00:00-03:00",
  },
  {
    id: "cli-012",
    code: "CLI-000012",
    name: "Patrícia Gomes Comércio ME",
    type: "pessoa_juridica",
    document: "98.765.432/0001-10",
    status: "ativo",
    phone: "(11) 3210-4567",
    email: "contato@patriciagomes.com.br",
    address: "Rua da Mooca, 1850 - São Paulo, SP",
    fantasyName: "Patrícia Gomes Conveniência",
    stateRegistration: "987.654.321.110",
    responsibleName: "Patrícia Gomes",
    vehicleIds: ["vei-012", "vei-015"],
    createdAt: "2025-05-30T09:45:00-03:00",
    notes: "Loja de conveniência — entrega das vans é prioritária pela manhã.",
  },
];

export function getClientById(id: string): Client | undefined {
  return CLIENTS.find((client) => client.id === id);
}
