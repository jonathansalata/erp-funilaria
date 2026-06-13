"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft } from "lucide-react";

import { KanbanBoard, KanbanCard, type KanbanColumnData } from "@/components/shared/kanban-board";
import { PatioVehicleSheet } from "@/components/patio/patio-vehicle-sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClientById } from "@/lib/mock-data/clients";
import { formatDateTime } from "@/lib/utils";
import {
  JOURNEY_STAGE_META,
  getVehicleLabel,
  type JourneyStage,
  type Vehicle,
} from "@/lib/mock-data/vehicles";
import { useErpDataStore } from "@/stores/erp-data-store";

const JOURNEY_STAGES = Object.keys(JOURNEY_STAGE_META) as JourneyStage[];

export default function PatioPage() {
  const vehicles = useErpDataStore((state) => state.vehicles);
  const setVehicleJourneyStage = useErpDataStore((state) => state.setVehicleJourneyStage);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [pendingStage, setPendingStage] = useState<JourneyStage | null>(null);
  const [viewingVehicleId, setViewingVehicleId] = useState<string | null>(null);

  const editingVehicle = vehicles.find((vehicle) => vehicle.id === editingVehicleId) ?? null;
  const viewingVehicle = vehicles.find((vehicle) => vehicle.id === viewingVehicleId) ?? null;

  const columns = useMemo<KanbanColumnData<Vehicle>[]>(
    () =>
      JOURNEY_STAGES.map((stage) => ({
        id: stage,
        title: JOURNEY_STAGE_META[stage].label,
        variant: JOURNEY_STAGE_META[stage].variant,
        items: vehicles.filter((vehicle) => vehicle.journeyStage === stage),
      })),
    [vehicles],
  );

  function openStageSheet(vehicle: Vehicle) {
    setEditingVehicleId(vehicle.id);
    setPendingStage(vehicle.journeyStage);
  }

  function closeStageSheet() {
    setEditingVehicleId(null);
    setPendingStage(null);
  }

  function saveStage() {
    if (!editingVehicle || !pendingStage) return;

    setVehicleJourneyStage(editingVehicle.id, pendingStage);
    toast.success(
      `${getVehicleLabel(editingVehicle)} movido para "${JOURNEY_STAGE_META[pendingStage].label}".`,
    );
    closeStageSheet();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pátio</h1>
        <p className="text-muted-foreground text-sm">
          Jornada do veículo dentro da oficina, da chegada à liberação para retirada.
        </p>
      </div>

      <KanbanBoard
        columns={columns}
        getItemId={(vehicle) => vehicle.id}
        renderCard={(vehicle) => (
          <VehicleJourneyCard
            vehicle={vehicle}
            onChangeStage={() => openStageSheet(vehicle)}
            onView={() => setViewingVehicleId(vehicle.id)}
          />
        )}
      />

      <PatioVehicleSheet
        vehicle={viewingVehicle}
        open={viewingVehicle !== null}
        onOpenChange={(open) => !open && setViewingVehicleId(null)}
      />

      <Sheet open={editingVehicle !== null} onOpenChange={(open) => !open && closeStageSheet()}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Mudar etapa</SheetTitle>
            <SheetDescription>
              {editingVehicle
                ? `${getVehicleLabel(editingVehicle)} — ${editingVehicle.plate}`
                : "Selecione a nova etapa do veículo no pátio."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-2 px-4">
            <Select
              value={pendingStage ?? undefined}
              onValueChange={(value) => value && setPendingStage(value as JourneyStage)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {JOURNEY_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {JOURNEY_STAGE_META[stage].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeStageSheet}>
              Cancelar
            </Button>
            <Button onClick={saveStage}>Salvar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VehicleJourneyCard({
  vehicle,
  onChangeStage,
  onView,
}: {
  vehicle: Vehicle;
  onChangeStage: () => void;
  onView: () => void;
}) {
  const client = getClientById(vehicle.clientId);

  return (
    <KanbanCard className="cursor-pointer" onClick={onView}>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{getVehicleLabel(vehicle)}</span>
        <span className="text-muted-foreground text-xs">{vehicle.plate}</span>
      </div>

      {client && <span className="text-muted-foreground text-xs">{client.name}</span>}

      {vehicle.journeyStage && vehicle.journeyStageUpdatedAt && (
        <StatusBadge
          variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant}
          dot
          className="self-start"
        >
          {formatDateTime(vehicle.journeyStageUpdatedAt)}
        </StatusBadge>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-1 self-start"
        onClick={(event) => {
          event.stopPropagation();
          onChangeStage();
        }}
      >
        <ArrowRightLeft />
        Mudar etapa
      </Button>
    </KanbanCard>
  );
}
