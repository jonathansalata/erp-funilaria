"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { PROFILE_STATUS_LABELS, PROFILE_STATUS_VARIANTS } from "@/lib/auth/status";
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
  const { user, profile, roleName, isLoading, refreshProfile } = useAuth();
  const { permissions, can } = usePermissions();

  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (profile && profile.id !== loadedProfileId) {
    setLoadedProfileId(profile.id);
    setPhone(profile.phone ?? "");
    setJobTitle(profile.job_title ?? "");
  }

  if (isLoading) {
    return null;
  }

  if (!profile || !user) {
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

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }

    setIsUploadingAvatar(true);
    const supabase = createClient();
    const path = `${user.id}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setIsUploadingAvatar(false);
      toast.error("Não foi possível enviar a foto.");
      return;
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${publicUrl.publicUrl}?t=${Date.now()}`;

    const { error: rpcError } = await supabase.rpc("fn_update_my_avatar", {
      p_avatar_url: avatarUrl,
    });
    setIsUploadingAvatar(false);

    if (rpcError) {
      toast.error("Não foi possível atualizar a foto de perfil.");
      return;
    }

    await refreshProfile();
    toast.success("Foto de perfil atualizada.");
  }

  async function handleRemoveAvatar() {
    if (!user) return;
    setIsUploadingAvatar(true);
    const supabase = createClient();

    await supabase.storage.from("avatars").remove([`${user.id}.jpg`]);

    const { error } = await supabase.rpc("fn_update_my_avatar", { p_avatar_url: null });
    setIsUploadingAvatar(false);

    if (error) {
      toast.error("Não foi possível remover a foto de perfil.");
      return;
    }

    await refreshProfile();
    toast.success("Foto de perfil removida.");
  }

  async function handleChangePassword() {
    if (!profile) return;
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsChangingPassword(true);
    const supabase = createClient();

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (reauthError) {
      setIsChangingPassword(false);
      toast.error("Senha atual incorreta.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);

    if (error) {
      toast.error("Não foi possível alterar a senha.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Senha alterada com sucesso.");
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
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{profile.full_name}</span>
              <span className="text-muted-foreground text-sm">{profile.email}</span>
              <div className="flex flex-wrap items-center gap-2">
                {roleName && <StatusBadge>{roleName}</StatusBadge>}
                <StatusBadge variant={PROFILE_STATUS_VARIANTS[profile.status]}>
                  {PROFILE_STATUS_LABELS[profile.status] ?? profile.status}
                </StatusBadge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
            >
              {isUploadingAvatar ? "Enviando..." : "Alterar Foto"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar || !profile.avatar_url}
              onClick={handleRemoveAvatar}
            >
              Remover Foto
            </Button>
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
          <CardTitle>Segurança</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Senha atual</Label>
              <InputGroup>
                <InputGroupInput
                  id="current-password"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-sm"
                    aria-label={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
                    onClick={() => setShowPasswords((value) => !value)}
                  >
                    {showPasswords ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? "Salvando..." : "Alterar senha"}
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
