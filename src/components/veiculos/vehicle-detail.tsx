import Link from "next/link";

import { EntityHeader } from "@/components/shared/entity-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientById } from "@/lib/mock-data/clients";
import { getVehicleTimeline, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { INSPECTION_STATUS_META, getInspectionsForVehicle } from "@/lib/mock-data/inspections";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { QUOTES, calculateQuoteTotal } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { SERVICE_ORDERS } from "@/lib/mock-data/service-orders-data";
import { JOURNEY_STAGE_META, getVehicleLabel, type Vehicle } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

type VehicleDetailProps = {
  vehicle: Vehicle;
};

export function VehicleDetail({ vehicle }: VehicleDetailProps) {
  const client = getClientById(vehicle.clientId);
  const inspections = getInspectionsForVehicle(vehicle.id);
  const quotes = QUOTES.filter((quote) => quote.vehicleId === vehicle.id);
  const serviceOrders = SERVICE_ORDERS.filter((order) => order.vehicleId === vehicle.id);
  const events = getVehicleTimeline(vehicle.id).map(mapEntityEventToTimelineEntry);

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={getVehicleLabel(vehicle)}
        code={vehicle.code}
        status={
          vehicle.journeyStage
            ? {
                label: JOURNEY_STAGE_META[vehicle.journeyStage].label,
                variant: JOURNEY_STAGE_META[vehicle.journeyStage].variant,
              }
            : undefined
        }
        description={`Placa: ${vehicle.plate}`}
        backHref={client ? `/clientes/${client.id}` : "/veiculos"}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Especificações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marca</span>
                <span>{vehicle.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modelo</span>
                <span>{vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ano</span>
                <span>{vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cor</span>
                <span>{vehicle.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placa</span>
                <span>{vehicle.plate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KM</span>
                <span>{vehicle.mileage.toLocaleString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vistorias</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {inspections.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma vistoria registrada.</p>
              ) : (
                inspections.map((inspection) => (
                  <Link
                    key={inspection.id}
                    href={`/vistorias/${inspection.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{inspection.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(inspection.createdAt)}
                      </span>
                    </div>
                    <StatusBadge variant={INSPECTION_STATUS_META[inspection.status].variant}>
                      {INSPECTION_STATUS_META[inspection.status].title}
                    </StatusBadge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orçamentos & Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {quotes.length === 0 && serviceOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum orçamento ou OS registrado.</p>
              ) : (
                <>
                  {quotes.map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/orcamentos/${quote.id}`}
                      className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{quote.code}</span>
                        <span className="text-muted-foreground text-xs">Orçamento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {formatCurrency(calculateQuoteTotal(quote.items).total)}
                        </span>
                        <StatusBadge variant={QUOTE_STATUS_META[quote.status].variant}>
                          {QUOTE_STATUS_META[quote.status].title}
                        </StatusBadge>
                      </div>
                    </Link>
                  ))}
                  {serviceOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/ordens-servico/${order.id}`}
                      className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{order.code}</span>
                        <span className="text-muted-foreground text-xs">Ordem de serviço</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          Previsão: {formatDate(order.dueDate)}
                        </span>
                        <StatusBadge variant={SERVICE_ORDER_STATUS_META[order.status].variant}>
                          {SERVICE_ORDER_STATUS_META[order.status].title}
                        </StatusBadge>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline entries={events} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Proprietário</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Jornada atual</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {vehicle.journeyStage ? (
                <>
                  <StatusBadge variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant}>
                    {JOURNEY_STAGE_META[vehicle.journeyStage].label}
                  </StatusBadge>
                  {vehicle.journeyStageUpdatedAt && (
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">Atualizado em</span>
                      <span>{formatDateTime(vehicle.journeyStageUpdatedAt)}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Veículo fora do pátio.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
