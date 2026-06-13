/**
 * Usuários e Permissões (Fase 2B, Módulo 01).
 * Estrutura preparada para futuro RBAC real — nesta fase, permissões são granulares por
 * módulo e mantidas em memória/localStorage via Zustand, sem autenticação real.
 */

export type UserRole = "administrador" | "gerente" | "financeiro" | "operacional" | "personalizado";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  administrador: "Administrador",
  gerente: "Gerente",
  financeiro: "Financeiro",
  operacional: "Operacional",
  personalizado: "Personalizado",
};

export type UserStatus = "ativo" | "inativo" | "bloqueado";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  bloqueado: "Bloqueado",
};

export const USER_STATUS_VARIANTS: Record<UserStatus, "success" | "default" | "destructive"> = {
  ativo: "success",
  inativo: "default",
  bloqueado: "destructive",
};

/** Ações granulares de permissão, aplicáveis a cada módulo do ERP. */
export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "cancel"
  | "financial";

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Visualizar",
  create: "Criar",
  edit: "Editar",
  delete: "Excluir",
  approve: "Aprovar",
  cancel: "Cancelar",
  financial: "Financeiro",
};

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "cancel",
  "financial",
];

/** Módulos do ERP cobertos pela matriz de permissões. */
export type ModuleKey =
  | "dashboard"
  | "clientes"
  | "veiculos"
  | "vistorias"
  | "orcamentos"
  | "ordens_servico"
  | "agenda"
  | "financeiro"
  | "relatorios"
  | "auditoria"
  | "configuracoes";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  veiculos: "Veículos",
  vistorias: "Vistorias",
  orcamentos: "Orçamentos",
  ordens_servico: "Ordens de Serviço",
  agenda: "Agenda",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  auditoria: "Auditoria",
  configuracoes: "Configurações",
};

export const MODULE_KEYS: ModuleKey[] = [
  "dashboard",
  "clientes",
  "veiculos",
  "vistorias",
  "orcamentos",
  "ordens_servico",
  "agenda",
  "financeiro",
  "relatorios",
  "auditoria",
  "configuracoes",
];

export type ModulePermissions = Record<PermissionAction, boolean>;

export type PermissionMatrix = Record<ModuleKey, ModulePermissions>;

function permissions(overrides: Partial<ModulePermissions> = {}): ModulePermissions {
  return {
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    cancel: false,
    financial: false,
    ...overrides,
  };
}

function matrixForAll(overrides: Partial<ModulePermissions>): PermissionMatrix {
  return MODULE_KEYS.reduce((acc, moduleKey) => {
    acc[moduleKey] = permissions(overrides);
    return acc;
  }, {} as PermissionMatrix);
}

export function emptyPermissionMatrix(): PermissionMatrix {
  return matrixForAll({});
}

/** Matrizes de permissão padrão por perfil — ponto de partida ao criar/trocar perfil. */
export const ROLE_PERMISSION_PRESETS: Record<
  Exclude<UserRole, "personalizado">,
  PermissionMatrix
> = {
  administrador: matrixForAll({
    view: true,
    create: true,
    edit: true,
    delete: true,
    approve: true,
    cancel: true,
    financial: true,
  }),
  gerente: {
    ...matrixForAll({ view: true, create: true, edit: true, approve: true, cancel: true }),
    configuracoes: permissions({ view: true, edit: true }),
    auditoria: permissions({ view: true }),
    financeiro: permissions({
      view: true,
      create: true,
      edit: true,
      approve: true,
      cancel: true,
      financial: true,
    }),
  },
  financeiro: {
    ...matrixForAll({ view: true }),
    financeiro: permissions({
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
      cancel: true,
      financial: true,
    }),
    relatorios: permissions({ view: true, financial: true }),
  },
  operacional: {
    ...matrixForAll({ view: true }),
    clientes: permissions({ view: true, create: true, edit: true }),
    veiculos: permissions({ view: true, create: true, edit: true }),
    vistorias: permissions({ view: true, create: true, edit: true }),
    orcamentos: permissions({ view: true, create: true, edit: true }),
    ordens_servico: permissions({ view: true, create: true, edit: true }),
    agenda: permissions({ view: true, create: true, edit: true }),
    financeiro: permissions({}),
    auditoria: permissions({}),
    configuracoes: permissions({}),
  },
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  photoUrl?: string;
  role: UserRole;
  status: UserStatus;
  permissions: PermissionMatrix;
  mustChangePassword: boolean;
  createdAt: string;
  /**
   * Data/hora do último acesso (Fase 2B.6.1, Bloco 16.2). Sem autenticação real
   * nesta fase, este campo é preenchido com dados simulados; em uma fase futura
   * com Supabase Auth, deve ser alimentado a partir de `last_sign_in_at`.
   */
  lastLoginAt?: string;
};

/**
 * Resolve o usuário "logado" nesta fase (sem autenticação real — Fase 2B.6.1,
 * Bloco 16.1): usa `currentUserId` quando aponta para um usuário existente;
 * caso contrário, cai para o primeiro administrador ativo e, na ausência
 * deste, para o primeiro usuário ativo cadastrado.
 */
export function resolveCurrentUser(users: User[], currentUserId?: string): User | undefined {
  const byId = users.find((user) => user.id === currentUserId);
  if (byId) return byId;

  const activeAdmin = users.find(
    (user) => user.status === "ativo" && user.role === "administrador",
  );
  if (activeAdmin) return activeAdmin;

  return users.find((user) => user.status === "ativo");
}

export const USERS: User[] = [
  {
    id: "usr-001",
    name: "Ana Paula Ferreira",
    email: "ana.ferreira@boaformafunilaria.com.br",
    phone: "(11) 98888-1111",
    jobTitle: "Administradora do sistema",
    role: "administrador",
    status: "ativo",
    permissions: ROLE_PERMISSION_PRESETS.administrador,
    mustChangePassword: false,
    createdAt: "2026-01-10T08:00:00-03:00",
    lastLoginAt: "2026-06-12T07:45:00-03:00",
  },
  {
    id: "usr-002",
    name: "Roberto Lima",
    email: "roberto.lima@boaformafunilaria.com.br",
    phone: "(11) 98888-2222",
    jobTitle: "Gerente de operações",
    role: "gerente",
    status: "ativo",
    permissions: ROLE_PERMISSION_PRESETS.gerente,
    mustChangePassword: false,
    createdAt: "2026-02-03T08:00:00-03:00",
    lastLoginAt: "2026-06-11T18:20:00-03:00",
  },
  {
    id: "usr-003",
    name: "Patrícia Souza",
    email: "patricia.souza@boaformafunilaria.com.br",
    phone: "(11) 98888-3333",
    jobTitle: "Analista financeira",
    role: "financeiro",
    status: "ativo",
    permissions: ROLE_PERMISSION_PRESETS.financeiro,
    mustChangePassword: false,
    createdAt: "2026-03-15T08:00:00-03:00",
    lastLoginAt: "2026-06-12T08:05:00-03:00",
  },
  {
    id: "usr-004",
    name: "Carlos Eduardo",
    email: "carlos.eduardo@boaformafunilaria.com.br",
    phone: "(11) 98888-4444",
    jobTitle: "Funileiro",
    role: "operacional",
    status: "ativo",
    permissions: ROLE_PERMISSION_PRESETS.operacional,
    mustChangePassword: false,
    createdAt: "2026-03-20T08:00:00-03:00",
    lastLoginAt: "2026-06-11T17:30:00-03:00",
  },
  {
    id: "usr-005",
    name: "Diego Santos",
    email: "diego.santos@boaformafunilaria.com.br",
    phone: "(11) 98888-5555",
    jobTitle: "Pintor",
    role: "operacional",
    status: "inativo",
    permissions: ROLE_PERMISSION_PRESETS.operacional,
    mustChangePassword: false,
    createdAt: "2026-04-02T08:00:00-03:00",
    lastLoginAt: "2026-05-28T17:00:00-03:00",
  },
  {
    id: "usr-006",
    name: "Estagiário Recepção",
    email: "recepcao.estagio@boaformafunilaria.com.br",
    phone: "(11) 98888-6666",
    jobTitle: "Recepção (estágio)",
    role: "personalizado",
    status: "bloqueado",
    permissions: {
      ...emptyPermissionMatrix(),
      dashboard: permissions({ view: true }),
      clientes: permissions({ view: true, create: true }),
      vistorias: permissions({ view: true, create: true }),
      agenda: permissions({ view: true, create: true, edit: true }),
    },
    mustChangePassword: true,
    createdAt: "2026-05-20T08:00:00-03:00",
    lastLoginAt: "2026-06-05T09:10:00-03:00",
  },
];
