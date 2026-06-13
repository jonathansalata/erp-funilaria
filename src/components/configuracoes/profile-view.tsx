"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  emptyPermissionMatrix,
  MODULE_KEYS,
  MODULE_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  resolveCurrentUser,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  USER_STATUS_VARIANTS,
} from "@/lib/mock-data/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

/**
 * Perfil do usuário "logado" (Fase 2B.6, Bloco 12). Sem autenticação real:
 * `currentUserId` aponta para um registro de `USERS` mantido na store, em
 * estrutura compatível com futura integração ao Supabase Auth (Fase 3).
 */
export function ProfileView() {
  const currentUserId = useErpDataStore((state) => state.currentUserId);
  const users = useErpDataStore((state) => state.users);
  const updateUser = useErpDataStore((state) => state.updateUser);

  const user = resolveCurrentUser(users, currentUserId);

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [loadedUserId, setLoadedUserId] = useState(user?.id);

  if (user && user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    setPhone(user.phone ?? "");
    setJobTitle(user.jobTitle ?? "");
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold">Meu perfil</h1>
        <p className="text-muted-foreground text-sm">Usuário não encontrado.</p>
      </div>
    );
  }

  function handleSave() {
    updateUser(user!.id, { phone: phone.trim(), jobTitle: jobTitle.trim() });
    toast.success("Perfil atualizado com sucesso.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Meu perfil</h1>
        <p className="text-muted-foreground text-sm">
          Dados do usuário conectado nesta sessão. Sem autenticação real nesta fase.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground text-sm">{user.email}</span>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge>{USER_ROLE_LABELS[user.role]}</StatusBadge>
                <StatusBadge variant={USER_STATUS_VARIANTS[user.status]}>
                  {USER_STATUS_LABELS[user.status]}
                </StatusBadge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-phone">Telefone</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-job-title">Cargo</Label>
              <Input
                id="profile-job-title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
              />
            </div>
          </div>

          {user.lastLoginAt && (
            <p className="text-muted-foreground text-xs">
              Último acesso: {formatDateTime(user.lastLoginAt)}
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar alterações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Minhas permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  {PERMISSION_ACTIONS.map((action) => (
                    <TableHead key={action} className="text-center">
                      {PERMISSION_ACTION_LABELS[action]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULE_KEYS.map((moduleKey) => {
                  const modulePermissions =
                    user.permissions[moduleKey] ?? emptyPermissionMatrix()[moduleKey];
                  return (
                    <TableRow key={moduleKey}>
                      <TableCell className="font-medium">{MODULE_LABELS[moduleKey]}</TableCell>
                      {PERMISSION_ACTIONS.map((action) => (
                        <TableCell key={action} className="text-center">
                          {modulePermissions[action] ? "✓" : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
