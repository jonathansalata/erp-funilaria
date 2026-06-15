"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { UserFormDialog, type UserFormValues } from "@/components/usuarios/user-form-dialog";
import { UserPermissionsDialog } from "@/components/usuarios/user-permissions-dialog";
import { ResetPasswordDialog } from "@/components/usuarios/reset-password-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { PROFILE_STATUS_LABELS, PROFILE_STATUS_VARIANTS } from "@/lib/auth/status";
import type { ApiUser, RoleOption } from "@/lib/auth/usuarios-types";
import { formatDateTime } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UsersView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | undefined>(undefined);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<ApiUser | undefined>(undefined);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<ApiUser | undefined>(undefined);
  const [deletingUser, setDeletingUser] = useState<ApiUser | undefined>(undefined);

  async function fetchUsers() {
    const response = await fetch("/api/usuarios");
    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      toast.error(data.error ?? "Não foi possível carregar os usuários.");
      return;
    }

    setUsers(data.users ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de dados via API
    fetchUsers();
    fetch("/api/usuarios/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data.roles ?? []))
      .catch(() => undefined);
  }, []);

  function openNew() {
    setEditingUser(undefined);
    setFormOpen(true);
  }

  function openEdit(user: ApiUser) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function handleSubmit(values: UserFormValues): Promise<boolean> {
    const isCreate = !editingUser;
    const response = await fetch(isCreate ? "/api/usuarios" : `/api/usuarios/${editingUser!.id}`, {
      method: isCreate ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Não foi possível salvar o usuário.");
      return false;
    }

    await fetchUsers();
    toast.success(isCreate ? "Usuário criado com sucesso." : "Usuário atualizado com sucesso.");
    return true;
  }

  function openPermissions(user: ApiUser) {
    setPermissionsUser(user);
    setPermissionsOpen(true);
  }

  function openResetPassword(user: ApiUser) {
    setResetPasswordUser(user);
    setResetPasswordOpen(true);
  }

  async function handleResetPassword(password: string): Promise<boolean> {
    if (!resetPasswordUser) return false;

    const response = await fetch(`/api/usuarios/${resetPasswordUser.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Não foi possível redefinir a senha.");
      return false;
    }

    toast.success("Senha redefinida com sucesso.");
    return true;
  }

  async function handleSetStatus(user: ApiUser, status: "active" | "inactive" | "blocked") {
    const response = await fetch(`/api/usuarios/${user.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Não foi possível atualizar o status do usuário.");
      return;
    }

    await fetchUsers();
    toast.success("Status do usuário atualizado.");
  }

  async function handleDelete() {
    if (!deletingUser) return;

    const response = await fetch(`/api/usuarios/${deletingUser.id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Não foi possível excluir o usuário.");
      return;
    }

    await fetchUsers();
    toast.success("Usuário excluído com sucesso.");
  }

  const columns: DataTableColumn<ApiUser>[] = [
    {
      id: "name",
      header: "Usuário",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {row.avatar_url && <AvatarImage src={row.avatar_url} alt={row.full_name} />}
            <AvatarFallback>{initials(row.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.full_name}</span>
            <span className="text-muted-foreground text-xs">{row.email}</span>
          </div>
        </div>
      ),
      sortValue: (row) => row.full_name,
    },
    {
      id: "jobTitle",
      header: "Cargo",
      cell: (row) => row.job_title ?? "—",
      sortValue: (row) => row.job_title ?? "",
    },
    {
      id: "role",
      header: "Perfil",
      cell: (row) => row.role?.name ?? "—",
      sortValue: (row) => row.role?.name ?? "",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={PROFILE_STATUS_VARIANTS[row.status]}>
          {PROFILE_STATUS_LABELS[row.status] ?? row.status}
        </StatusBadge>
      ),
    },
    {
      id: "createdAt",
      header: "Cadastro",
      cell: (row) => formatDateTime(row.created_at),
      sortValue: (row) => row.created_at,
      className: "whitespace-nowrap",
    },
    {
      id: "lastLoginAt",
      header: "Último acesso",
      cell: (row) => (row.last_login_at ? formatDateTime(row.last_login_at) : "—"),
      sortValue: (row) => row.last_login_at ?? "",
      className: "whitespace-nowrap",
    },
    {
      id: "actions",
      header: "Ações",
      cell: (row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
            <Button size="sm" variant="outline" onClick={() => openPermissions(row)}>
              <ShieldCheck />
              Permissões
            </Button>
            <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
              <Pencil />
              Editar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-48">
                {!isSelf && row.status !== "active" && (
                  <DropdownMenuItem
                    className="whitespace-nowrap"
                    onClick={() => handleSetStatus(row, "active")}
                  >
                    <Unlock />
                    Reativar
                  </DropdownMenuItem>
                )}
                {!isSelf && row.status !== "inactive" && (
                  <DropdownMenuItem
                    className="whitespace-nowrap"
                    onClick={() => handleSetStatus(row, "inactive")}
                  >
                    <Lock />
                    Inativar
                  </DropdownMenuItem>
                )}
                {!isSelf && row.status !== "blocked" && (
                  <DropdownMenuItem
                    className="whitespace-nowrap"
                    onClick={() => handleSetStatus(row, "blocked")}
                  >
                    <Lock />
                    Bloquear
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="whitespace-nowrap"
                  onClick={() => openResetPassword(row)}
                >
                  <KeyRound />
                  Resetar senha
                </DropdownMenuItem>
                {!isSelf && (
                  <DropdownMenuItem
                    variant="destructive"
                    className="whitespace-nowrap"
                    onClick={() => setDeletingUser(row)}
                  >
                    <Trash2 />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      className: "text-right",
    },
  ];

  const filters: DataTableFilter<ApiUser>[] = [
    {
      id: "role",
      label: "Perfil",
      options: Array.from(new Set(users.map((u) => u.role?.name).filter(Boolean))).map((name) => ({
        label: name as string,
        value: name as string,
      })),
      predicate: (row, value) => row.role?.name === value,
    },
    {
      id: "status",
      label: "Status",
      options: Object.entries(PROFILE_STATUS_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (row, value) => row.status === value,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Usuários</h1>
          <p className="text-muted-foreground text-sm">
            Usuários do sistema, perfis de acesso e permissões granulares por módulo.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus />
          Novo usuário
        </Button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Buscar por nome, e-mail ou cargo..."
        searchFn={(row, query) =>
          row.full_name.toLowerCase().includes(query) ||
          row.email.toLowerCase().includes(query) ||
          (row.job_title ?? "").toLowerCase().includes(query)
        }
        filters={filters}
        emptyMessage={isLoading ? "Carregando usuários..." : "Nenhum usuário cadastrado."}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        roles={roles}
        onSubmit={handleSubmit}
      />

      <UserPermissionsDialog
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
        user={permissionsUser}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        user={resetPasswordUser}
        onSubmit={handleResetPassword}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(undefined)}
        onConfirm={handleDelete}
        itemLabel={deletingUser ? `o usuário ${deletingUser.full_name}` : undefined}
      />
    </div>
  );
}
