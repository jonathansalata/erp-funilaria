import type { StatusVariant } from "@/components/shared/status-badge";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/mock-data/financeiro";

/**
 * Configurações Gerais (Fase 2B) — cadastros globais reutilizáveis em todo o ERP.
 * "Toda informação reutilizável deve nascer em Configurações." Estrutura mockada,
 * persistida via Zustand/localStorage — sem integração com backend nesta fase.
 */

/** Item simples de catálogo (nome + status ativo/inativo). */
export type CatalogItem = {
  id: string;
  name: string;
  active: boolean;
};

export type CatalogKey =
  | "services"
  | "categories"
  | "costCenters"
  | "teams"
  | "cancellationReasons"
  | "refusalReasons"
  | "observationTemplates";

export const CATALOG_META: Record<
  CatalogKey,
  { title: string; description: string; itemLabel: string; placeholder: string }
> = {
  services: {
    title: "Serviços",
    description: "Tipos de serviço oferecidos pela oficina, usados em Orçamentos e OS.",
    itemLabel: "o serviço",
    placeholder: "Ex.: Funilaria",
  },
  categories: {
    title: "Categorias",
    description: "Categorias usadas para classificar itens de orçamento, peças e relatórios.",
    itemLabel: "a categoria",
    placeholder: "Ex.: Peças",
  },
  costCenters: {
    title: "Centros de Custo",
    description: "Centros de custo usados para classificar despesas no Financeiro.",
    itemLabel: "o centro de custo",
    placeholder: "Ex.: Operacional",
  },
  teams: {
    title: "Equipes",
    description: "Equipes técnicas usadas na Agenda e nas Ordens de Serviço.",
    itemLabel: "a equipe",
    placeholder: "Ex.: Equipe Funilaria A",
  },
  cancellationReasons: {
    title: "Motivos de Cancelamento",
    description: "Motivos padronizados para cancelamento de Orçamentos e Ordens de Serviço.",
    itemLabel: "o motivo",
    placeholder: "Ex.: Cliente desistiu do serviço",
  },
  refusalReasons: {
    title: "Motivos de Recusa",
    description: "Motivos padronizados para recusa de Orçamentos.",
    itemLabel: "o motivo",
    placeholder: "Ex.: Preço acima do esperado",
  },
  observationTemplates: {
    title: "Modelos de Observação",
    description: "Frases prontas reutilizáveis em Orçamentos, OS e Vistorias.",
    itemLabel: "o modelo",
    placeholder: "Ex.: Veículo recebido com tanque reserva.",
  },
};

export const DEFAULT_SERVICES: CatalogItem[] = [
  { id: "svc-001", name: "Funilaria", active: true },
  { id: "svc-002", name: "Pintura", active: true },
  { id: "svc-003", name: "Polimento", active: true },
  { id: "svc-004", name: "Martelinho de ouro", active: true },
  { id: "svc-005", name: "Higienização", active: true },
  { id: "svc-006", name: "Outros", active: true },
];

export const DEFAULT_CATEGORIES: CatalogItem[] = [
  { id: "cat-001", name: "Peças", active: true },
  { id: "cat-002", name: "Mão de obra", active: true },
  { id: "cat-003", name: "Terceiros", active: true },
  { id: "cat-004", name: "Materiais de consumo", active: true },
];

export const DEFAULT_COST_CENTERS: CatalogItem[] = [
  { id: "cc-001", name: "Operacional", active: true },
  { id: "cc-002", name: "Administrativo", active: true },
  { id: "cc-003", name: "Marketing", active: true },
  { id: "cc-004", name: "Oficina", active: true },
  { id: "cc-005", name: "Outros", active: true },
];

export const DEFAULT_TEAMS: CatalogItem[] = [
  { id: "team-001", name: "Equipe Funilaria A", active: true },
  { id: "team-002", name: "Equipe Pintura A", active: true },
  { id: "team-003", name: "Equipe Higienização", active: true },
];

export const DEFAULT_CANCELLATION_REASONS: CatalogItem[] = [
  { id: "canc-001", name: "Cliente desistiu do serviço", active: true },
  { id: "canc-002", name: "Cliente optou por outra oficina", active: true },
  { id: "canc-003", name: "Erro de cadastro", active: true },
  { id: "canc-004", name: "Duplicidade de registro", active: true },
];

export const DEFAULT_REFUSAL_REASONS: CatalogItem[] = [
  { id: "ref-001", name: "Preço acima do esperado", active: true },
  { id: "ref-002", name: "Cliente utilizará seguro próprio", active: true },
  { id: "ref-003", name: "Prazo de entrega incompatível", active: true },
  { id: "ref-004", name: "Cliente não retornou contato", active: true },
];

export const DEFAULT_OBSERVATION_TEMPLATES: CatalogItem[] = [
  { id: "obs-001", name: "Veículo recebido com tanque reserva.", active: true },
  { id: "obs-002", name: "Avarias pré-existentes registradas na vistoria inicial.", active: true },
  { id: "obs-003", name: "Cliente solicitou contato antes de iniciar o serviço.", active: true },
  {
    id: "obs-004",
    name: "Peça sob encomenda — prazo sujeito à disponibilidade do fornecedor.",
    active: true,
  },
];

export const DEFAULT_CATALOGS: Record<CatalogKey, CatalogItem[]> = {
  services: DEFAULT_SERVICES,
  categories: DEFAULT_CATEGORIES,
  costCenters: DEFAULT_COST_CENTERS,
  teams: DEFAULT_TEAMS,
  cancellationReasons: DEFAULT_CANCELLATION_REASONS,
  refusalReasons: DEFAULT_REFUSAL_REASONS,
  observationTemplates: DEFAULT_OBSERVATION_TEMPLATES,
};

/** Cadastro de banco/agência/conta usado no Financeiro. */
export type BankAccount = {
  id: string;
  bankName: string;
  agency: string;
  account: string;
  active: boolean;
};

export const DEFAULT_BANKS: BankAccount[] = [
  {
    id: "bank-001",
    bankName: "Banco do Brasil",
    agency: "1234-5",
    account: "98765-4",
    active: true,
  },
  {
    id: "bank-002",
    bankName: "Caixa Econômica Federal",
    agency: "0987",
    account: "12345-6",
    active: true,
  },
];

/** Configuração de forma de pagamento — habilita/desabilita e permite renomear o rótulo exibido. */
export type PaymentMethodConfig = {
  method: PaymentMethod;
  label: string;
  active: boolean;
};

export const DEFAULT_PAYMENT_METHOD_CONFIGS: PaymentMethodConfig[] = PAYMENT_METHODS.map(
  (method) => ({
    method,
    label: PAYMENT_METHOD_LABELS[method],
    active: true,
  }),
);

/** Status personalizáveis (Orçamentos e Ordens de Serviço). */
export type StatusConfig = {
  /** Chave técnica imutável — usada em todo o sistema (QuoteStatus / ServiceOrderStatus). */
  key: string;
  /** Rótulo exibido — editável pelo administrador. */
  label: string;
  variant: StatusVariant;
  active: boolean;
};

export const DEFAULT_QUOTE_STATUS_CONFIGS: StatusConfig[] = [
  { key: "rascunho", label: "Rascunho", variant: "default", active: true },
  { key: "enviado", label: "Enviado", variant: "info", active: true },
  { key: "em_negociacao", label: "Em negociação", variant: "warning", active: true },
  { key: "aprovado", label: "Aprovado", variant: "success", active: true },
  { key: "recusado", label: "Recusado", variant: "destructive", active: true },
  { key: "cancelado", label: "Cancelado", variant: "destructive", active: true },
];

export const DEFAULT_SERVICE_ORDER_STATUS_CONFIGS: StatusConfig[] = [
  { key: "aguardando_inicio", label: "Aguardando início", variant: "default", active: true },
  { key: "em_execucao", label: "Em execução", variant: "info", active: true },
  { key: "aguardando_peca", label: "Aguardando peça", variant: "warning", active: true },
  { key: "finalizado", label: "Finalizado", variant: "success", active: true },
  { key: "entregue", label: "Entregue", variant: "primary", active: true },
  { key: "cancelado", label: "Cancelado", variant: "destructive", active: true },
];

/** Dados da empresa (Configurações da Empresa). */
export type CompanyInfo = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  stateRegistration: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  logoUrl: string;
  signatureUrl: string;
  stampUrl: string;
};

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  fantasyName: "Funilaria Boa Forma",
  legalName: "Boa Forma Funilaria e Pintura Ltda.",
  cnpj: "12.345.678/0001-90",
  stateRegistration: "123.456.789.110",
  address: "Av. das Indústrias, 1200 — Distrito Industrial, São Paulo/SP",
  phone: "(11) 4002-8922",
  whatsapp: "(11) 98888-7766",
  email: "contato@boaformafunilaria.com.br",
  logoUrl: "",
  signatureUrl: "",
  stampUrl: "",
};

/** Configuração de documentos (cabeçalho/rodapé/observações/garantia aplicados aos PDFs). */
export type DocumentSettings = {
  headerText: string;
  footerText: string;
  defaultObservations: string;
  warrantyText: string;
};

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  headerText: "Boa Forma Funilaria e Pintura Ltda. — CNPJ 12.345.678/0001-90",
  footerText: "Documento gerado eletronicamente pelo sistema ERP Funilaria.",
  defaultObservations: "Valores sujeitos a alteração após avaliação técnica presencial.",
  warrantyText:
    "Garantia de 90 dias para serviços de funilaria e pintura, contados a partir da data de entrega do veículo.",
};

/** Histórico de versões — exibido em Configurações > Sobre o Sistema. */
export type VersionHistoryEntry = {
  version: string;
  date: string;
  notes: string;
};

export const VERSION_HISTORY: VersionHistoryEntry[] = [
  { version: "0.1.0", date: "2026-06-11", notes: "Fase 1 — ERP operacional mockado concluído." },
  { version: "0.0.2", date: "2026-06-08", notes: "Fase 0 concluída e validada." },
  {
    version: "0.0.1",
    date: "2026-06-06",
    notes: "Estrutura inicial do projeto (Create Next App).",
  },
];

/** Ajuda interna (mock) — Módulo 05. */
export type HelpArticle = {
  id: string;
  category: string;
  title: string;
  content: string;
};

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "help-001",
    category: "Primeiros passos",
    title: "Como cadastrar um novo cliente",
    content:
      "Acesse Clientes > Novo cliente, preencha os dados obrigatórios (nome, documento e contato) e salve. É possível cadastrar veículos vinculados ao cliente na mesma tela.",
  },
  {
    id: "help-002",
    category: "Orçamentos",
    title: "Como aprovar um orçamento",
    content:
      "Abra o orçamento desejado no Pipeline de Orçamentos, altere o status para 'Aprovado' e, em seguida, utilize a ação 'Converter em OS' para gerar a Ordem de Serviço.",
  },
  {
    id: "help-003",
    category: "Financeiro",
    title: "Como registrar um pagamento parcial",
    content:
      "Em Contas a Receber, selecione a conta e clique em 'Receber'. É possível informar múltiplas formas de pagamento e valores parciais — o saldo restante permanece em aberto.",
  },
  {
    id: "help-004",
    category: "Configurações",
    title: "Como inativar um serviço, categoria ou motivo",
    content:
      "Em Configurações, abra a aba correspondente (Serviços, Categorias, Motivos etc.), localize o item e use a ação 'Inativar'. Itens inativos deixam de aparecer nos formulários, mas permanecem no histórico.",
  },
  {
    id: "help-005",
    category: "Usuários e Permissões",
    title: "Como criar um usuário com perfil personalizado",
    content:
      "Em Usuários, clique em 'Novo usuário', selecione o perfil 'Personalizado' e ajuste as permissões por módulo (Visualizar, Criar, Editar, Excluir, Aprovar, Cancelar, Financeiro).",
  },
  {
    id: "help-006",
    category: "Orçamentos",
    title: "Como editar um orçamento",
    content:
      "Na tela do orçamento, clique em 'Editar orçamento' (disponível enquanto o status for Rascunho, Enviado ou Em negociação). É possível alterar cliente, veículo, itens, valores, observações e validade. As alterações geram um registro na linha do tempo do orçamento.",
  },
  {
    id: "help-007",
    category: "Ordens de Serviço",
    title: "Como editar uma ordem de serviço",
    content:
      "Na tela da OS, clique em 'Editar OS' (disponível enquanto a OS não estiver Entregue ou Cancelada). É possível alterar itens, observações e a previsão de entrega. O técnico responsável continua sendo alterado pela ação de status. As alterações geram um registro na linha do tempo da OS.",
  },
  {
    id: "help-008",
    category: "Configurações",
    title: "Como criar e usar templates de checklist",
    content:
      "Em Configurações > Templates de Checklist, crie templates para Vistoria ou Ordem de Serviço, organizando etapas e itens. Ao criar uma nova vistoria ou OS, selecione o template desejado para preencher o checklist automaticamente. Templates inativos não aparecem na seleção, mas continuam disponíveis para edição.",
  },
  {
    id: "help-009",
    category: "Documentos",
    title: "Como gerar PDF e enviar por WhatsApp",
    content:
      "Nas telas de Orçamento, Ordem de Serviço, Cliente e Veículo, utilize os botões 'Exportar PDF' e 'Imprimir' para gerar o documento. Em Orçamentos e Ordens de Serviço, o botão 'Enviar por WhatsApp' abre uma conversa com o cliente já com uma mensagem padrão preenchida (use o WhatsApp/telefone cadastrado do cliente).",
  },
  {
    id: "help-010",
    category: "Clientes",
    title: "Ficha 360° do cliente",
    content:
      "A tela de detalhes do cliente reúne veículos vinculados, histórico de orçamentos e OS, linha do tempo, indicadores (total gasto, ticket médio, última visita) e resumo financeiro. Use 'Exportar PDF' para gerar a ficha completa do cliente.",
  },
  {
    id: "help-011",
    category: "Veículos",
    title: "Ficha completa do veículo",
    content:
      "A tela de detalhes do veículo reúne indicadores (total de orçamentos, total de OS, valor gasto, última visita), histórico de vistorias, orçamentos e OS, linha do tempo e resumo financeiro. Use 'Exportar PDF' para gerar a ficha completa do veículo.",
  },
];

/** Logs Técnicos (mock) — Módulo 06. */
export type TechnicalLogLevel = "error" | "warning" | "exception" | "validation";

export const TECHNICAL_LOG_LEVEL_LABELS: Record<TechnicalLogLevel, string> = {
  error: "Erro",
  warning: "Aviso",
  exception: "Exceção",
  validation: "Falha de validação",
};

export const TECHNICAL_LOG_LEVEL_VARIANTS: Record<TechnicalLogLevel, StatusVariant> = {
  error: "destructive",
  warning: "warning",
  exception: "destructive",
  validation: "info",
};

export type TechnicalLog = {
  id: string;
  timestamp: string;
  level: TechnicalLogLevel;
  module: string;
  user: string;
  message: string;
};

export const TECHNICAL_LOGS: TechnicalLog[] = [
  {
    id: "log-001",
    timestamp: "2026-06-11T08:12:00-03:00",
    level: "validation",
    module: "Orçamentos",
    user: "Ana Paula Ferreira",
    message: "Tentativa de salvar orçamento sem itens informados.",
  },
  {
    id: "log-002",
    timestamp: "2026-06-11T10:45:00-03:00",
    level: "warning",
    module: "Financeiro",
    user: "Sistema",
    message: "Conta a receber RCB-2026-000041 vencida há mais de 5 dias.",
  },
  {
    id: "log-003",
    timestamp: "2026-06-10T16:30:00-03:00",
    level: "error",
    module: "Vistorias",
    user: "Recepção",
    message: "Falha ao anexar arquivo: formato não suportado (.heic).",
  },
  {
    id: "log-004",
    timestamp: "2026-06-09T09:05:00-03:00",
    level: "exception",
    module: "Ordens de Serviço",
    user: "Sistema",
    message: "Exceção ao calcular previsão de entrega: data de início ausente.",
  },
  {
    id: "log-005",
    timestamp: "2026-06-08T14:20:00-03:00",
    level: "validation",
    module: "Clientes",
    user: "Carlos Eduardo",
    message: "CPF/CNPJ informado em formato inválido.",
  },
];
