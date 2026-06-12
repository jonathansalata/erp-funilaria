"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";

import { NAV_GROUPS } from "@/lib/constants/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarVersion } from "@/components/layout/sidebar-version";

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const collapsedGroups = useUIStore((state) => state.collapsedGroups);
  const toggleGroup = useUIStore((state) => state.toggleGroup);

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh shrink-0 flex-col border-r transition-[width] duration-200 ease-in-out lg:flex",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 px-4">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground font-heading flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-bold">
          EF
        </div>
        {!sidebarCollapsed && (
          <span className="font-heading truncate text-base font-semibold">ERP Funilaria</span>
        )}
      </div>

      <Separator className="bg-sidebar-border shrink-0" />

      <ScrollArea className="min-h-0 flex-1">
        <TooltipProvider>
          <nav className="flex flex-col gap-4 px-2 py-4">
            {NAV_GROUPS.map((group) => {
              const isGroupCollapsed = collapsedGroups.includes(group.title);

              return (
                <div key={group.title}>
                  {!sidebarCollapsed && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      className="text-sidebar-foreground/60 hover:text-sidebar-foreground flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-semibold tracking-wider uppercase transition-colors"
                    >
                      <span>{group.title}</span>
                      <ChevronDown
                        className={cn(
                          "size-3.5 shrink-0 transition-transform",
                          isGroupCollapsed && "-rotate-90",
                        )}
                      />
                    </button>
                  )}

                  {(sidebarCollapsed || !isGroupCollapsed) && (
                    <ul className={cn("flex flex-col gap-1", !sidebarCollapsed && "mt-1")}>
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        const linkContent = (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              sidebarCollapsed && "justify-center px-0",
                            )}
                          >
                            <item.icon className="size-4 shrink-0" />
                            {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                          </Link>
                        );

                        return (
                          <li key={item.href}>
                            {sidebarCollapsed ? (
                              <Tooltip>
                                <TooltipTrigger render={linkContent} />
                                <TooltipContent side="right">{item.title}</TooltipContent>
                              </Tooltip>
                            ) : (
                              linkContent
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <Separator className="bg-sidebar-border shrink-0" />

      <div className="shrink-0 p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center justify-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="size-4 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="size-4 shrink-0" />
              <span>Recolher</span>
            </>
          )}
        </button>

        {!sidebarCollapsed && (
          <>
            <Separator className="bg-sidebar-border my-2" />
            <SidebarVersion />
          </>
        )}
      </div>
    </aside>
  );
}
