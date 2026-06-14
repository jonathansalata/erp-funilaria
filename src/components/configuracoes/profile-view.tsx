"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import {
  MODULE_KEYS,
  MODULE_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
} from "@/lib/mock-data/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
};

const STATUS_VARIANTS: Record<string, "success" | "default" | "destructive"> = {
  active: "success",
  inactive: "default",
  blocked: "destructive",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Perfil do usuário autenticado (Fase 3.3 — Supabase Auth + `profiles`). */
export function ProfileView() {
  const { profile, roleName, isLoading, refreshProfile } = useAuth();
  const { permissions, can } = usePermissions();

  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);

  if (profile && profile.id !== loadedProfileId) {
    setLoadedProfileId(profile.id);
    setPhone(profile.phone ?? "");
    setJobTitle(profile.job_title ?? "");
  }

  if (isLoading) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-2xl font-semibold">Meu perfil</h1>
        <p className="text-muted-foreground text-sm">Usuário não encontrado.</p>
      </div>
    );
  }

  async function handleSave() {
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("fn_update_my_profile", {
      p_phone: phone.trim(),
      p_job_title: jobTitle.trim(),
    });
    setIsSaving(false);

    if (error) {
      toast.error("Não foi possível atualizar o perfil.");
      return;
    }

    await refreshProfile();
    toast.success("Perfil atualizado com sucesso.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Meu perfil</h1>
        <p className="text-muted-foreground text-sm">Dados do usuário autenticado.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{profile.full_name}</span>
              <span className="text-muted-foreground text-sm">{profile.email}</span>
              <div className="flex flex-wrap items-center gap-2">
                {roleName && <StatusBadge>{roleName}</StatusBadge>}
                <StatusBadge variant={STATUS_VARIANTS[profile.status]}>
                  {STATUS_LABELS[profile.status] ?? profile.status}
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

          <p className="text-muted-foreground text-xs">
            Atualizado em: {formatDateTime(profile.updated_at)}
          </p>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
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
                {MODULE_KEYS.map((moduleKey) => (
                  <TableRow key={moduleKey}>
                    <TableCell className="font-medium">{MODULE_LABELS[moduleKey]}</TableCell>
                    {PERMISSION_ACTIONS.map((action) => (
                      <TableCell key={action} className="text-center">
                        {can(moduleKey, action) ? "✓" : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {permissions.length === 0 && (
            <p className="text-muted-foreground mt-2 text-sm">
              Nenhuma permissão atribuída ao seu papel.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
