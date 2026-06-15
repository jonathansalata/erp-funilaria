"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";

import { NAV_GROUPS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { formatDateTime } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Header() {
  const pathname = usePathname();
  const { user, profile, isLoading, profileError, signOut } = useAuth();

  // Bloco 48A: instrumentação de diagnóstico — valores de `profile`/`user` recebidos
  // do AuthProvider no momento da renderização do Header.
  console.log(
    `[HEADER_DEBUG] render — user.id=${user?.id ?? null}, profile.id=${profile?.id ?? null}, profile.full_name=${profile?.full_name ?? null}, profile.avatar_url=${profile?.avatar_url ?? null}, profile.last_login_at=${profile?.last_login_at ?? null}, isLoading=${isLoading}, profileError=${profileError}`,
  );

  // Bloco 42/43: diferencia "carregando" (sem profile ainda, mas sem erro) de "erro ao carregar"
  // (sem profile e com `profileError`) e de "sem perfil" (sessão sem profile vinculado).
  const avatarFallback = profile
    ? initials(profile.full_name)
    : isLoading
      ? "…"
      : profileError
        ? "!"
        : "?";
  // Bloco 43: o e-mail nunca é exibido no Header — apenas `profile.full_name`.
  const lastAccessLabel = profile
    ? profile.last_login_at
      ? `Último acesso: ${formatDateTime(profile.last_login_at)}`
      : "Último acesso: Primeiro acesso"
    : null;

  return (
    <header className="bg-background border-border sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-72 gap-0 p-0">
          <SheetHeader className="border-sidebar-border border-b">
            <SheetTitle className="text-sidebar-foreground font-heading">ERP Funilaria</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 overflow-y-auto px-2 py-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-sidebar-foreground/60 px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">
                  {group.title}
                </p>
                <ul className="mt-1 flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <SheetClose
                          render={<Link href={item.href} />}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </SheetClose>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Separator orientation="vertical" className="hidden h-6 lg:block" />

      <div className="hidden lg:block">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <InputGroup className="hidden w-64 sm:flex">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Buscar cliente, veículo, OS..." />
        </InputGroup>

        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="size-5" />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-auto gap-2 px-1.5 py-1" />}
          >
            <Avatar size="sm">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            {profile && (
              <span className="hidden flex-col items-start sm:flex">
                <span className="text-sm font-medium">{profile.full_name}</span>
                <span className="text-muted-foreground text-xs">{lastAccessLabel}</span>
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/configuracoes/perfil" />}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/redefinir-senha" />}>
                Alterar Senha
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/configuracoes" />}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
