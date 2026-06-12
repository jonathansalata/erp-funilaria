import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CalendarDays,
  Car,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  KanbanSquare,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  SquareParking,
} from "lucide-react";

/**
 * Estrutura de navegação da sidebar — agrupada por frequência de uso, conforme
 * docs/ARCHITECTURE.md, seção 4.6.1. Cada item mapeia para um `module` da tabela
 * `permissions` (a ser usado por `usePermissions()`/`<PermissionGate>` a partir da Fase 1).
 */

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  module: string;
};

export type NavGroup = {
  title: string;
  /** Grupos com `defaultCollapsed` iniciam recolhidos na sidebar. */
  defaultCollapsed?: boolean;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Visão Geral",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard, module: "dashboard" }],
  },
  {
    title: "Atendimento",
    items: [
      {
        title: "Pipeline de Orçamentos",
        href: "/orcamentos",
        icon: KanbanSquare,
        module: "orcamentos",
      },
      {
        title: "Pipeline de OS",
        href: "/ordens-servico",
        icon: Wrench,
        module: "ordens_servico",
      },
      { title: "Pátio", href: "/patio", icon: SquareParking, module: "ordens_servico" },
      { title: "Vistorias", href: "/vistorias", icon: ClipboardCheck, module: "vistorias" },
      { title: "Agenda", href: "/agenda", icon: CalendarDays, module: "agenda" },
    ],
  },
  {
    title: "Cadastros",
    items: [
      { title: "Clientes", href: "/clientes", icon: Users, module: "clientes" },
      { title: "Veículos", href: "/veiculos", icon: Car, module: "clientes" },
    ],
  },
  {
    title: "Financeiro",
    defaultCollapsed: true,
    items: [
      {
        title: "Contas a Receber",
        href: "/financeiro/contas-a-receber",
        icon: Wallet,
        module: "financeiro",
      },
      {
        title: "Contas a Pagar",
        href: "/financeiro/contas-a-pagar",
        icon: CreditCard,
        module: "financeiro",
      },
      {
        title: "Fluxo de Caixa",
        href: "/financeiro/fluxo-de-caixa",
        icon: Banknote,
        module: "financeiro",
      },
      { title: "DRE", href: "/financeiro/dre", icon: TrendingUp, module: "financeiro" },
    ],
  },
  {
    title: "Gestão",
    defaultCollapsed: true,
    items: [
      { title: "Relatórios", href: "/relatorios", icon: FileBarChart, module: "relatorios" },
      { title: "Auditoria", href: "/auditoria", icon: ShieldCheck, module: "auditoria" },
      { title: "Usuários", href: "/usuarios", icon: Users, module: "usuarios" },
      { title: "Configurações", href: "/configuracoes", icon: Settings, module: "configuracoes" },
    ],
  },
];

/** Resolve o título de uma rota a partir de NAV_GROUPS, usado nos breadcrumbs. */
export function findNavItemByHref(href: string): NavItem | undefined {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.href === href);
    if (item) return item;
  }
  return undefined;
}
