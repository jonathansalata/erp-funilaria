"use client";

import { useState } from "react";
import Link from "next/link";

import { InspectionStatusActions } from "@/components/vistorias/inspection-status-actions";
import { DamageMap } from "@/components/vistorias/damage-map";
import { ChecklistCard } from "@/components/shared/checklist-card";
import { EntityHeader } from "@/components/shared/entity-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Timeline } from "@/components/shared/timeline";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
} from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/lib/mock-data/clients";
import { getEventsForEntity, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { INSPECTION_STATUS_META, type Inspection } from "@/lib/mock-data/inspections";
import type { ChecklistItem } from "@/lib/mock-data/service-orders-data";
import { getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { useErpDataStore } from "@/stores/erp-data-store";

type InspectionDetailProps = {
  inspection: Inspection;
};

export function InspectionDetail({ inspection }: InspectionDetailProps) {
  const status = useErpDataStore(
    (state) =>
      state.inspections.find((item) => item.id === inspection.id)?.status ?? inspection.status,
  );
  const changeInspectionStatus = useErpDataStore((state) => state.changeInspectionStatus);
  const quote = useErpDataStore((state) =>
    inspection.convertedQuoteId
      ? state.quotes.find((item) => item.id === inspection.convertedQuoteId)
      : undefined,
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(inspection.checklist);
  const [photos, setPhotos] = useState(inspection.photos);

  const client = getClientById(inspection.clientId);
  const vehicle = getVehicleById(inspection.vehicleId);
  const events = getEventsForEntity("inspection", inspection.id).map(mapEntityEventToTimelineEntry);

  function toggleChecklistItem(id: string, done: boolean) {
    setChecklist((current) => current.map((item) => (item.id === id ? { ...item, done } : item)));
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={client?.name ?? "Cliente não encontrado"}
        code={inspection.code}
        status={{
          label: INSPECTION_STATUS_META[status].title,
          variant: INSPECTION_STATUS_META[status].variant,
        }}
        description={vehicle ? getVehicleLabel(vehicle) : "Veículo não encontrado"}
        backHref="/vistorias"
        actions={
          <InspectionStatusActions
            inspection={inspection}
            status={status}
            onStatusChange={(newStatus) => changeInspectionStatus(inspection.id, newStatus)}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de avarias</CardTitle>
            </CardHeader>
            <CardContent>
              <DamageMap damagePoints={inspection.damagePoints} readOnly />
            </CardContent>
          </Card>

          <ChecklistCard items={checklist} onItemToggle={toggleChecklistItem} groupByCategory />

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
              <CardTitle>Linha do tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline entries={events} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do veículo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {vehicle ? (
                <>
                  <Link href={`/veiculos/${vehicle.id}`} className="font-medium hover:underline">
                    {getVehicleLabel(vehicle)}
                  </Link>
                  <p className="text-muted-foreground">Placa: {vehicle.plate}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Veículo não encontrado.</p>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">KM na vistoria</span>
                <span>{inspection.mileage.toLocaleString("pt-BR")}</span>
              </div>
              <Progress value={inspection.fuelLevel} className="flex-col gap-1.5">
                <div className="flex w-full items-center justify-between">
                  <ProgressLabel className="text-muted-foreground text-xs font-normal">
                    Combustível
                  </ProgressLabel>
                  <span className="text-muted-foreground text-xs">{inspection.fuelLevel}%</span>
                </div>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              {client ? (
                <>
                  <Link href={`/clientes/${client.id}`} className="font-medium hover:underline">
                    {client.name}
                  </Link>
                  <p className="text-muted-foreground">{client.document}</p>
                  <p className="text-muted-foreground">{client.phone}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Cliente não encontrado.</p>
              )}
            </CardContent>
          </Card>

          {inspection.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{inspection.notes}</p>
              </CardContent>
            </Card>
          )}

          {quote && (
            <Card>
              <CardHeader>
                <CardTitle>Orçamento gerado</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/orcamentos/${quote.id}`} className="font-medium hover:underline">
                  {quote.code}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
