import { create } from "zustand";
import { persist } from "zustand/middleware";

import { NAV_GROUPS } from "@/lib/constants/navigation";

const DEFAULT_COLLAPSED_GROUPS = NAV_GROUPS.filter((group) => group.defaultCollapsed).map(
  (group) => group.title,
);

type UIState = {
  /** Sidebar inteira recolhida para o modo "rail" (apenas ícones). */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  /** Títulos dos grupos de navegação atualmente recolhidos. */
  collapsedGroups: string[];
  toggleGroup: (title: string) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      collapsedGroups: DEFAULT_COLLAPSED_GROUPS,
      toggleGroup: (title) =>
        set((state) => ({
          collapsedGroups: state.collapsedGroups.includes(title)
            ? state.collapsedGroups.filter((t) => t !== title)
            : [...state.collapsedGroups, title],
        })),
    }),
    {
      name: "erp-ui-store",
    },
  ),
);
