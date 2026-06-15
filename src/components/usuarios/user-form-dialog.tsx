"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiUser, RoleOption } from "@/lib/auth/usuarios-types";

export type UserFormValues = {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  roleId: string | null;
  password?: string;
};

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ApiUser;
  roles: RoleOption[];
  onSubmit: (values: UserFormValues) => Promise<boolean>;
};

const EMPTY_VALUES = {
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  roleId: null as string | null,
  password: "",
  confirmPassword: "",
};

export function UserFormDialog({ open, onOpenChange, user, roles, onSubmit }: UserFormDialogProps) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncedKey, setSyncedKey] = useState<string | null>(null);

  // O Dialog é controlado externamente (`setFormOpen(true)` em `users-view.tsx`), então
  // `onOpenChange` do Base UI só dispara em eventos de fechamento (Esc/backdrop/botão "Cancelar"),
  // nunca quando o pai abre o modal. Sincronizar `values` durante a renderização (mesmo padrão de
  // `profile-view.tsx`) garante que o modo EDIT carregue os dados do `user` atual a cada abertura
  // (e não os de uma edição anterior) e que o modo CREATE sempre comece vazio.
  const dialogKey = open ? (user?.id ?? "__new__") : null;

  if (dialogKey !== syncedKey) {
    setSyncedKey(dialogKey);
    setError(null);
    if (dialogKey) {
      setValues(
        user
          ? {
              name: user.full_name,
              email: user.email,
              phone: user.phone ?? "",
              jobTitle: user.job_title ?? "",
              roleId: user.role_id,
              password: "",
              confirmPassword: "",
            }
          : EMPTY_VALUES,
      );
    }
  }

  const isCreate = !user;
  const isValid =
    values.name.trim() !== "" &&
    values.email.trim() !== "" &&
    (!isCreate || (values.password.length >= 8 && values.password === values.confirmPassword));

  async function handleSubmit() {
    if (!isValid) {
      if (isCreate && values.password.length < 8) {
        setError("A senha deve ter no mínimo 8 caracteres.");
      } else if (isCreate && values.password !== values.confirmPassword) {
        setError("As senhas não coincidem.");
      }
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const ok = await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      jobTitle: values.jobTitle.trim(),
      roleId: values.roleId,
      ...(isCreate ? { password: values.password } : {}),
    });
    setIsSubmitting(false);

    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize os dados cadastrais do usuário."
              : "Defina a senha de acesso — o usuário poderá fazer login imediatamente."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">Nome</Label>
            <Input
              id="user-name"
              placeholder="Nome completo"
              value={values.name}
              onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="nome@empresa.com.br"
                value={values.email}
                onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-phone">Telefone</Label>
              <Input
                id="user-phone"
                placeholder="(00) 00000-0000"
                value={values.phone}
                onChange={(event) => setValues((v) => ({ ...v, phone: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-job-title">Cargo</Label>
              <Input
                id="user-job-title"
                placeholder="Ex.: Funileiro"
                value={values.jobTitle}
                onChange={(event) => setValues((v) => ({ ...v, jobTitle: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-role">Perfil</Label>
              <Select
                value={values.roleId ?? ""}
                onValueChange={(value) => setValues((v) => ({ ...v, roleId: value || null }))}
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Selecione o perfil">
                    {(value: string | null) =>
                      roles.find((role) => role.id === value)?.name ?? "Selecione o perfil"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCreate && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-password">Senha</Label>
                <InputGroup>
                  <InputGroupInput
                    id="user-password"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(event) => setValues((v) => ({ ...v, password: event.target.value }))}
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
                <Label htmlFor="user-confirm-password">Confirmar senha</Label>
                <Input
                  id="user-confirm-password"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    setValues((v) => ({ ...v, confirmPassword: event.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Salvando..." : user ? "Salvar alterações" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
