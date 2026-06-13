"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { QuoteItemsEditor } from "@/components/orcamentos/quote-items-editor";
import { EntityHeader } from "@/components/shared/entity-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLIENTS } from "@/lib/mock-data/clients";
import type { QuoteItem } from "@/lib/mock-data/quotes-data";
import { getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { useErpDataStore } from "@/stores/erp-data-store";

type ComboboxOption = { value: string; label: string };

export function NewQuoteForm() {
  const router = useRouter();
  const createQuote = useErpDataStore((state) => state.createQuote);
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const clientOptions = useMemo<ComboboxOption[]>(
    () =>
      CLIENTS.map((client) => ({ value: client.id, label: `${client.name} — ${client.document}` })),
    [],
  );

  const selectedClient = CLIENTS.find((client) => client.id === clientId);

  const vehicleOptions = useMemo<ComboboxOption[]>(() => {
    if (!selectedClient) return [];
    return selectedClient.vehicleIds
      .map((id) => getVehicleById(id))
      .filter((vehicle): vehicle is NonNullable<typeof vehicle> => vehicle !== undefined)
      .map((vehicle) => ({
        value: vehicle.id,
        label: `${getVehicleLabel(vehicle)} — ${vehicle.plate}`,
      }));
  }, [selectedClient]);

  const selectedClientOption = clientOptions.find((option) => option.value === clientId) ?? null;
  const selectedVehicleOption = vehicleOptions.find((option) => option.value === vehicleId) ?? null;

  function handleSubmit() {
    if (!clientId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!vehicleId) {
      toast.error("Selecione um veículo.");
      return;
    }
    if (items.length === 0 || items.some((item) => !item.description.trim())) {
      toast.error("Adicione pelo menos um item com descrição.");
      return;
    }

    createQuote({
      clientId,
      vehicleId,
      items,
      notes: notes.trim() || undefined,
      validUntil: validUntil || undefined,
    });
    toast.success("Orçamento criado com sucesso.");
    router.push("/orcamentos");
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader title="Novo Orçamento" backHref="/orcamentos" />

      <Card>
        <CardHeader>
          <CardTitle>Cliente e veículo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quote-client">Cliente</Label>
            <Combobox
              items={clientOptions}
              value={selectedClientOption}
              onValueChange={(option) => {
                setClientId(option?.value ?? "");
                setVehicleId("");
              }}
            >
              <ComboboxInput id="quote-client" placeholder="Selecione um cliente" showClear />
              <ComboboxContent>
                <ComboboxEmpty>Nenhum cliente encontrado.</ComboboxEmpty>
                <ComboboxList>
                  <ComboboxCollection>
                    {(option: ComboboxOption) => (
                      <ComboboxItem key={option.value} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quote-vehicle">Veículo</Label>
            <Combobox
              items={vehicleOptions}
              value={selectedVehicleOption}
              onValueChange={(option) => setVehicleId(option?.value ?? "")}
              disabled={!selectedClient}
            >
              <ComboboxInput
                id="quote-vehicle"
                placeholder={
                  selectedClient ? "Selecione um veículo" : "Selecione um cliente primeiro"
                }
                showClear
                disabled={!selectedClient}
              />
              <ComboboxContent>
                <ComboboxEmpty>Nenhum veículo encontrado.</ComboboxEmpty>
                <ComboboxList>
                  <ComboboxCollection>
                    {(option: ComboboxOption) => (
                      <ComboboxItem key={option.value} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quote-valid-until">Válido até</Label>
            <Input
              id="quote-valid-until"
              type="date"
              value={validUntil}
              onChange={(event) => setValidUntil(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteItemsEditor items={items} onChange={setItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações sobre o orçamento..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/orcamentos")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>Criar orçamento</Button>
      </div>
    </div>
  );
}
