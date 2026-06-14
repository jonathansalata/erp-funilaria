"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_LABELS, type User, type UserRole } from "@/lib/mock-data/users";

export type UserFormValues = {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: UserRole;
};

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSubmit: (values: UserFormValues) => void;
};

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  role: "operacional",
};

export function UserFormDialog({ open, onOpenChange, user, onSubmit }: UserFormDialogProps) {
  const [values, setValues] = useState<UserFormValues>(EMPTY_VALUES);
  const [syncedKey, setSyncedKey] = useState<string | null>(null);

  // O Dialog é controlado externamente (`setFormOpen(true)` em `users-view.tsx`), então
  // `onOpenChange` do Base UI só dispara em eventos de fechamento (Esc/backdrop/botão "Cancelar"),
  // nunca quando o pai abre o modal. Sincronizar `values` durante a renderização (mesmo padrão de
  // `profile-view.tsx`) garante que o modo EDIT carregue os dados do `user` atual a cada abertura
  // (e não os de uma edição anterior) e que o modo CREATE sempre comece vazio.
  const dialogKey = open ? (user?.id ?? "__new__") : null;

  if (dialogKey !== syncedKey) {
    setSyncedKey(dialogKey);
    if (dialogKey) {
      setValues(
        user
          ? {
              name: user.name,
              email: user.email,
              phone: user.phone,
              jobTitle: user.jobTitle,
              role: user.role,
            }
          : EMPTY_VALUES,
      );
    }
  }

  const isValid = values.name.trim() !== "" && values.email.trim() !== "";

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      jobTitle: values.jobTitle.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize os dados cadastrais do usuário."
              : "Uma senha inicial provisória será atribuída — o usuário deverá trocá-la no primeiro acesso."}
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
                value={values.role}
                onValueChange={(value) =>
                  value && setValues((v) => ({ ...v, role: value as UserRole }))
                }
              >
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {user ? "Salvar alterações" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
