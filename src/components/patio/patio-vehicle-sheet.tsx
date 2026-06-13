"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getClientById } from "@/lib/mock-data/clients";
import { getVehicleTimeline, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { INSPECTION_STATUS_META } from "@/lib/mock-data/inspections";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { calculateServiceOrderTotal } from "@/lib/mock-data/service-orders-data";
import {
  JOURNEY_STAGE_META,
  VEHICLE_STATUS_META,
  getVehicleLabel,
  type Vehicle,
} from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type PatioVehicleSheetProps = {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PatioVehicleSheet({ vehicle, open, onOpenChange }: PatioVehicleSheetProps) {
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const inspections = useErpDataStore((state) => state.inspections);
  const events = useErpDataStore((state) => state.events);

  if (!vehicle) {
    return null;
  }

  const client = getClientById(vehicle.clientId);

  const latestInspection = inspections
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const latestQuote = quotes
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  const latestServiceOrder = serviceOrders
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  const timeline = getVehicleTimeline(events, vehicle.id).map(mapEntityEventToTimelineEntry);
  const statusMeta = VEHICLE_STATUS_META[vehicle.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{getVehicleLabel(vehicle)}</SheetTitle>
          <SheetDescription>
            {vehicle.code} · Placa: {vehicle.plate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">Status</h3>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant={statusMeta.variant}>{statusMeta.label}</StatusBadge>
              {vehicle.journeyStage ? (
                <StatusBadge variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant} dot>
                  {JOURNEY_STAGE_META[vehicle.journeyStage].label}
                </StatusBadge>
              ) : (
                <span className="text-muted-foreground text-xs">Fora do pátio</span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">Cliente</h3>
            {client ? (
              <div className="flex flex-col gap-0.5 text-sm">
                <span className="font-medium">{client.name}</span>
                <span className="text-muted-foreground">{client.document}</span>
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Cliente não encontrado.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">
              Vistoria vinculada
            </h3>
            {latestInspection ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{latestInspection.code}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(latestInspection.createdAt)}
                  </span>
                </div>
                <StatusBadge variant={INSPECTION_STATUS_META[latestInspection.status].variant}>
                  {INSPECTION_STATUS_META[latestInspection.status].title}
                </StatusBadge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhuma vistoria vinculada.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">
              Orçamento vinculado
            </h3>
            {latestQuote ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{latestQuote.code}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(calculateQuoteTotal(latestQuote.items).total)}
                  </span>
                </div>
                <StatusBadge variant={QUOTE_STATUS_META[latestQuote.status].variant}>
                  {QUOTE_STATUS_META[latestQuote.status].title}
                </StatusBadge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum orçamento vinculado.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">OS vinculada</h3>
            {latestServiceOrder ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{latestServiceOrder.code}</span>
                  <span className="text-muted-foreground text-xs">
                    Previsão: {formatDate(latestServiceOrder.dueDate)} ·{" "}
                    {formatCurrency(calculateServiceOrderTotal(latestServiceOrder.items))}
                  </span>
                </div>
                <StatusBadge variant={SERVICE_ORDER_STATUS_META[latestServiceOrder.status].variant}>
                  {SERVICE_ORDER_STATUS_META[latestServiceOrder.status].title}
                </StatusBadge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhuma OS vinculada.</p>
            )}
          </section>

          {vehicle.notes && (
            <section className="flex flex-col gap-2">
              <h3 className="text-muted-foreground text-xs font-semibold uppercase">Observações</h3>
              <p className="text-sm">{vehicle.notes}</p>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs font-semibold uppercase">Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum evento registrado.</p>
            ) : (
              <Timeline entries={timeline} />
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
