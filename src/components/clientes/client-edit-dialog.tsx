"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/lib/mock-data/clients";
import type { ClientFormFields } from "@/stores/erp-data-store";
import { useErpDataStore } from "@/stores/erp-data-store";

type ClientEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
};

function clientToFormValues(client: Client): ClientFormFields {
  return {
    name: client.name,
    type: client.type,
    document: client.document,
    phone: client.phone,
    whatsapp: client.whatsapp ?? "",
    email: client.email,
    address: client.address,
    zipCode: client.zipCode ?? "",
    street: client.street ?? "",
    number: client.number ?? "",
    complement: client.complement ?? "",
    neighborhood: client.neighborhood ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    rg: client.rg ?? "",
    birthDate: client.birthDate ?? "",
    fantasyName: client.fantasyName ?? "",
    stateRegistration: client.stateRegistration ?? "",
    responsibleName: client.responsibleName ?? "",
    notes: client.notes ?? "",
  };
}

const EMPTY_VALUES: ClientFormFields = {
  name: "",
  type: "pessoa_fisica",
  document: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  rg: "",
  birthDate: "",
  fantasyName: "",
  stateRegistration: "",
  responsibleName: "",
  notes: "",
};

export function ClientEditDialog({ open, onOpenChange, client }: ClientEditDialogProps) {
  const updateClient = useErpDataStore((state) => state.updateClient);
  const [values, setValues] = useState<ClientFormFields>(EMPTY_VALUES);
  const [syncedKey, setSyncedKey] = useState<string | null>(null);

  // O Dialog é controlado externamente (`setEditingClient(client)`), então `onOpenChange` do
  // Base UI só dispara ao fechar — nunca quando o pai abre o modal. Sincronizar `values` durante
  // a renderização (mesmo padrão de `user-form-dialog.tsx`) garante que o formulário sempre
  // carregue os dados do `client` atual a cada abertura.
  const dialogKey = open ? (client?.id ?? null) : null;

  if (dialogKey !== syncedKey) {
    setSyncedKey(dialogKey);
    if (dialogKey && client) {
      setValues(clientToFormValues(client));
    }
  }

  if (!client) return null;

  const isPf = client.type === "pessoa_fisica";
  const isValid =
    values.name.trim() !== "" && values.document.trim() !== "" && values.phone.trim() !== "";

  function handleSubmit() {
    if (!isValid || !client) return;

    const address = [
      values.street && values.number
        ? `${values.street}, ${values.number}`
        : values.street || values.number,
      values.complement,
      values.neighborhood,
      values.city && values.state
        ? `${values.city} - ${values.state}`
        : values.city || values.state,
    ]
      .filter(Boolean)
      .join(" - ");

    updateClient(client.id, {
      ...values,
      address: address || values.address,
      whatsapp: values.whatsapp?.trim() || undefined,
      zipCode: values.zipCode?.trim() || undefined,
      street: values.street?.trim() || undefined,
      number: values.number?.trim() || undefined,
      complement: values.complement?.trim() || undefined,
      neighborhood: values.neighborhood?.trim() || undefined,
      city: values.city?.trim() || undefined,
      state: values.state?.trim() || undefined,
      rg: values.rg?.trim() || undefined,
      birthDate: values.birthDate || undefined,
      fantasyName: values.fantasyName?.trim() || undefined,
      stateRegistration: values.stateRegistration?.trim() || undefined,
      responsibleName: values.responsibleName?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });

    toast.success("Cadastro atualizado com sucesso.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            {client.code} · As alterações geram um registro de auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-client-name">{isPf ? "Nome completo" : "Razão social"}</Label>
              <Input
                id="edit-client-name"
                value={values.name}
                onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-document">{isPf ? "CPF" : "CNPJ"}</Label>
              <Input
                id="edit-client-document"
                value={values.document}
                onChange={(event) => setValues((v) => ({ ...v, document: event.target.value }))}
              />
            </div>
            {isPf ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-client-rg">RG</Label>
                  <Input
                    id="edit-client-rg"
                    value={values.rg}
                    onChange={(event) => setValues((v) => ({ ...v, rg: event.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-client-birth-date">Data de nascimento</Label>
                  <Input
                    id="edit-client-birth-date"
                    type="date"
                    value={values.birthDate}
                    onChange={(event) =>
                      setValues((v) => ({ ...v, birthDate: event.target.value }))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-client-fantasy">Nome fantasia</Label>
                  <Input
                    id="edit-client-fantasy"
                    value={values.fantasyName}
                    onChange={(event) =>
                      setValues((v) => ({ ...v, fantasyName: event.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-client-ie">Inscrição estadual</Label>
                  <Input
                    id="edit-client-ie"
                    value={values.stateRegistration}
                    onChange={(event) =>
                      setValues((v) => ({ ...v, stateRegistration: event.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-client-responsible">Responsável</Label>
                  <Input
                    id="edit-client-responsible"
                    value={values.responsibleName}
                    onChange={(event) =>
                      setValues((v) => ({ ...v, responsibleName: event.target.value }))
                    }
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-phone">Telefone</Label>
              <Input
                id="edit-client-phone"
                value={values.phone}
                onChange={(event) => setValues((v) => ({ ...v, phone: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-whatsapp">WhatsApp</Label>
              <Input
                id="edit-client-whatsapp"
                value={values.whatsapp}
                onChange={(event) => setValues((v) => ({ ...v, whatsapp: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-client-email">Email</Label>
              <Input
                id="edit-client-email"
                type="email"
                value={values.email}
                onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-zip">CEP</Label>
              <Input
                id="edit-client-zip"
                value={values.zipCode}
                onChange={(event) => setValues((v) => ({ ...v, zipCode: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-client-street">Endereço</Label>
              <Input
                id="edit-client-street"
                value={values.street}
                onChange={(event) => setValues((v) => ({ ...v, street: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-number">Número</Label>
              <Input
                id="edit-client-number"
                value={values.number}
                onChange={(event) => setValues((v) => ({ ...v, number: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-complement">Complemento</Label>
              <Input
                id="edit-client-complement"
                value={values.complement}
                onChange={(event) => setValues((v) => ({ ...v, complement: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-neighborhood">Bairro</Label>
              <Input
                id="edit-client-neighborhood"
                value={values.neighborhood}
                onChange={(event) => setValues((v) => ({ ...v, neighborhood: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-city">Cidade</Label>
              <Input
                id="edit-client-city"
                value={values.city}
                onChange={(event) => setValues((v) => ({ ...v, city: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-client-state">Estado</Label>
              <Input
                id="edit-client-state"
                maxLength={2}
                value={values.state}
                onChange={(event) =>
                  setValues((v) => ({ ...v, state: event.target.value.toUpperCase() }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-client-notes">Observações</Label>
            <Textarea
              id="edit-client-notes"
              value={values.notes}
              onChange={(event) => setValues((v) => ({ ...v, notes: event.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
