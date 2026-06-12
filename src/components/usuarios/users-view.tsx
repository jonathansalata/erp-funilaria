"use client";

import { useState } from "react";
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

import { UserFormDialog, type UserFormValues } from "@/components/usuarios/user-form-dialog";
import { UserPermissionsDialog } from "@/components/usuarios/user-permissions-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  USER_STATUS_VARIANTS,
  type PermissionMatrix,
  type User,
} from "@/lib/mock-data/users";
import { formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UsersView() {
  const users = useErpDataStore((state) => state.users);
  const createUser = useErpDataStore((state) => state.createUser);
  const updateUser = useErpDataStore((state) => state.updateUser);
  const updateUserPermissions = useErpDataStore((state) => state.updateUserPermissions);
  const setUserStatus = useErpDataStore((state) => state.setUserStatus);
  const resetUserPassword = useErpDataStore((state) => state.resetUserPassword);
  const deleteUser = useErpDataStore((state) => state.deleteUser);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<User | undefined>(undefined);
  const [deletingUser, setDeletingUser] = useState<User | undefined>(undefined);

  function openNew() {
    setEditingUser(undefined);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormOpen(true);
  }

  function handleSubmit(values: UserFormValues) {
    if (editingUser) {
      updateUser(editingUser.id, values);
    } else {
      createUser(values);
    }
  }

  function openPermissions(user: User) {
    setPermissionsUser(user);
    setPermissionsOpen(true);
  }

  function handlePermissionsSubmit(matrix: PermissionMatrix) {
    if (permissionsUser) updateUserPermissions(permissionsUser.id, matrix);
  }

  const columns: DataTableColumn<User>[] = [
    {
      id: "name",
      header: "Usuário",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.name}</span>
            <span className="text-muted-foreground text-xs">{row.email}</span>
          </div>
        </div>
      ),
      sortValue: (row) => row.name,
    },
    {
      id: "jobTitle",
      header: "Cargo",
      cell: (row) => row.jobTitle,
      sortValue: (row) => row.jobTitle,
    },
    {
      id: "role",
      header: "Perfil",
      cell: (row) => USER_ROLE_LABELS[row.role],
      sortValue: (row) => USER_ROLE_LABELS[row.role],
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={USER_STATUS_VARIANTS[row.status]}>
          {USER_STATUS_LABELS[row.status]}
        </StatusBadge>
      ),
    },
    {
      id: "lastLogin",
      header: "Último acesso",
      cell: (row) => (row.lastLogin ? formatDateTime(row.lastLogin) : "—"),
      sortValue: (row) => row.lastLogin ?? "",
      className: "whitespace-nowrap",
    },
    {
      id: "actions",
      header: "Ações",
      cell: (row) => (
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
            <DropdownMenuContent align="end">
              {row.status !== "ativo" && (
                <DropdownMenuItem onClick={() => setUserStatus(row.id, "ativo")}>
                  <Unlock />
                  Reativar
                </DropdownMenuItem>
              )}
              {row.status !== "inativo" && (
                <DropdownMenuItem onClick={() => setUserStatus(row.id, "inativo")}>
                  <Lock />
                  Inativar
                </DropdownMenuItem>
              )}
              {row.status !== "bloqueado" && (
                <DropdownMenuItem onClick={() => setUserStatus(row.id, "bloqueado")}>
                  <Lock />
                  Bloquear
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => resetUserPassword(row.id)}>
                <KeyRound />
                Resetar senha
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeletingUser(row)}>
                <Trash2 />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  const filters: DataTableFilter<User>[] = [
    {
      id: "role",
      label: "Perfil",
      options: Object.entries(USER_ROLE_LABELS).map(([value, label]) => ({ label, value })),
      predicate: (row, value) => row.role === value,
    },
    {
      id: "status",
      label: "Status",
      options: Object.entries(USER_STATUS_LABELS).map(([value, label]) => ({ label, value })),
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
          row.name.toLowerCase().includes(query) ||
          row.email.toLowerCase().includes(query) ||
          row.jobTitle.toLowerCase().includes(query)
        }
        filters={filters}
        emptyMessage="Nenhum usuário cadastrado."
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSubmit={handleSubmit}
      />

      <UserPermissionsDialog
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
        user={permissionsUser}
        onSubmit={handlePermissionsSubmit}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(undefined)}
        onConfirm={() => {
          if (deletingUser) deleteUser(deletingUser.id);
        }}
        itemLabel={deletingUser ? `o usuário ${deletingUser.name}` : undefined}
      />
    </div>
  );
}
