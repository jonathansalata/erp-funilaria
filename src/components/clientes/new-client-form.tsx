"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EntityHeader } from "@/components/shared/entity-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/lib/mock-data/clients";

export function NewClientForm() {
  const router = useRouter();
  const [type, setType] = useState<Client["type"]>("pessoa_fisica");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (!document.trim()) {
      toast.error("Informe o documento (CPF ou CNPJ).");
      return;
    }
    if (!phone.trim()) {
      toast.error("Informe o telefone de contato.");
      return;
    }

    toast.success("Cliente criado com sucesso.");
    router.push("/clientes");
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader title="Novo Cliente" backHref="/clientes" />

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-type">Tipo de cliente</Label>
            <Select
              value={type}
              onValueChange={(value) => value && setType(value as Client["type"])}
            >
              <SelectTrigger id="client-type" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoa_fisica">Pessoa física</SelectItem>
                <SelectItem value="pessoa_juridica">Pessoa jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-name">
              {type === "pessoa_juridica" ? "Razão social" : "Nome completo"}
            </Label>
            <Input
              id="client-name"
              placeholder={type === "pessoa_juridica" ? "Nome da empresa" : "Nome do cliente"}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-document">{type === "pessoa_juridica" ? "CNPJ" : "CPF"}</Label>
            <Input
              id="client-document"
              placeholder={type === "pessoa_juridica" ? "00.000.000/0000-00" : "000.000.000-00"}
              value={document}
              onChange={(event) => setDocument(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-phone">Telefone</Label>
            <Input
              id="client-phone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-address">Endereço</Label>
            <Input
              id="client-address"
              placeholder="Rua, número - Bairro, Cidade, UF"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações sobre o cliente..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/clientes")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>Criar cliente</Button>
      </div>
    </div>
  );
}
