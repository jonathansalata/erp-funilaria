"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ChecklistCard } from "@/components/shared/checklist-card";
import { DamageMap } from "@/components/vistorias/damage-map";
import { EntityHeader } from "@/components/shared/entity-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
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
import type { Attachment } from "@/lib/mock-data/attachments";
import { INSPECTION_CHECKLIST_TEMPLATE, type DamagePoint } from "@/lib/mock-data/inspections";
import type { ChecklistItem } from "@/lib/mock-data/service-orders-data";
import { getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { useErpDataStore } from "@/stores/erp-data-store";

type ComboboxOption = { value: string; label: string };

export function NewInspectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createInspection = useErpDataStore((state) => state.createInspection);

  const [clientId, setClientId] = useState(searchParams.get("clientId") ?? "");
  const [vehicleId, setVehicleId] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelLevel, setFuelLevel] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    INSPECTION_CHECKLIST_TEMPLATE.map((item, index) => ({ id: `new-c${index + 1}`, ...item })),
  );
  const [damagePoints, setDamagePoints] = useState<DamagePoint[]>([]);
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState("");

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

  function toggleChecklistItem(id: string, done: boolean) {
    setChecklist((current) => current.map((item) => (item.id === id ? { ...item, done } : item)));
  }

  function handleSubmit() {
    if (!clientId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!vehicleId) {
      toast.error("Selecione um veículo.");
      return;
    }
    if (!mileage.trim()) {
      toast.error("Informe a quilometragem do veículo.");
      return;
    }

    createInspection({
      clientId,
      vehicleId,
      mileage: Number(mileage),
      fuelLevel: Number(fuelLevel) || 0,
      checklist,
      damagePoints,
      photos,
      notes: notes.trim() || undefined,
    });

    toast.success("Vistoria criada com sucesso.");
    router.push("/vistorias");
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader title="Nova Vistoria" backHref="/vistorias" />

      <Card>
        <CardHeader>
          <CardTitle>Cliente e veículo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inspection-client">Cliente</Label>
            <Combobox
              items={clientOptions}
              value={selectedClientOption}
              onValueChange={(option) => {
                setClientId(option?.value ?? "");
                setVehicleId("");
              }}
            >
              <ComboboxInput id="inspection-client" placeholder="Selecione um cliente" showClear />
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
            <Label htmlFor="inspection-vehicle">Veículo</Label>
            <Combobox
              items={vehicleOptions}
              value={selectedVehicleOption}
              onValueChange={(option) => setVehicleId(option?.value ?? "")}
              disabled={!selectedClient}
            >
              <ComboboxInput
                id="inspection-vehicle"
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
            <Label htmlFor="inspection-mileage">Quilometragem</Label>
            <Input
              id="inspection-mileage"
              type="number"
              min={0}
              placeholder="Ex.: 45000"
              value={mileage}
              onChange={(event) => setMileage(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inspection-fuel">Nível de combustível (%)</Label>
            <Input
              id="inspection-fuel"
              type="number"
              min={0}
              max={100}
              placeholder="Ex.: 75"
              value={fuelLevel}
              onChange={(event) => setFuelLevel(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <ChecklistCard
        title="Checklist de vistoria"
        items={checklist}
        onItemToggle={toggleChecklistItem}
        groupByCategory
      />

      <Card>
        <CardHeader>
          <CardTitle>Mapa de avarias</CardTitle>
        </CardHeader>
        <CardContent>
          <DamageMap damagePoints={damagePoints} onChange={setDamagePoints} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <FileDropzone files={photos} onFilesChange={setPhotos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações sobre a vistoria..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/vistorias")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>Criar vistoria</Button>
      </div>
    </div>
  );
}
