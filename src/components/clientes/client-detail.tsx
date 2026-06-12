import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { EntityHeader } from "@/components/shared/entity-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/lib/mock-data/clients";
import { getClientTimeline, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { QUOTES, calculateQuoteTotal } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { SERVICE_ORDERS } from "@/lib/mock-data/service-orders-data";
import { JOURNEY_STAGE_META, getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

const CLIENT_TYPE_LABELS: Record<Client["type"], string> = {
  pessoa_fisica: "Pessoa física",
  pessoa_juridica: "Pessoa jurídica",
};

type ClientDetailProps = {
  client: Client;
};

export function ClientDetail({ client }: ClientDetailProps) {
  const vehicles = client.vehicleIds
    .map(getVehicleById)
    .filter((v): v is NonNullable<typeof v> => v !== undefined);
  const quotes = QUOTES.filter((quote) => quote.clientId === client.id);
  const serviceOrders = SERVICE_ORDERS.filter((order) => order.clientId === client.id);
  const events = getClientTimeline(client.id).map(mapEntityEventToTimelineEntry);

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={client.name}
        code={client.code}
        description={`${CLIENT_TYPE_LABELS[client.type]} · ${client.document}`}
        backHref="/clientes"
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href={`/vistorias/novo?clientId=${client.id}`} />}
            >
              <FileText />
              Nova vistoria
            </Button>
            <Button render={<Link href={`/orcamentos/novo?clientId=${client.id}`} />}>
              <Plus />
              Novo orçamento
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Veículos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {vehicles.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum veículo cadastrado.</p>
              ) : (
                vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/veiculos/${vehicle.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{getVehicleLabel(vehicle)}</span>
                      <span className="text-muted-foreground text-xs">Placa: {vehicle.plate}</span>
                    </div>
                    {vehicle.journeyStage && (
                      <StatusBadge variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant}>
                        {JOURNEY_STAGE_META[vehicle.journeyStage].label}
                      </StatusBadge>
                    )}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orçamentos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {quotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum orçamento registrado.</p>
              ) : (
                quotes.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/orcamentos/${quote.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{quote.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {getVehicleLabel(getVehicleById(quote.vehicleId)!)}
                      </span>
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
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {serviceOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma ordem de serviço registrada.
                </p>
              ) : (
                serviceOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/ordens-servico/${order.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{order.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {getVehicleLabel(getVehicleById(order.vehicleId)!)}
                      </span>
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
                ))
              )}
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
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p className="text-muted-foreground">{client.phone}</p>
              <p className="text-muted-foreground">{client.email}</p>
              <p className="text-muted-foreground">{client.address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>{CLIENT_TYPE_LABELS[client.type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documento</span>
                <span>{client.document}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cadastrado em</span>
                <span>{formatDateTime(client.createdAt)}</span>
              </div>
              {client.notes && (
                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-muted-foreground">Observações</span>
                  <p>{client.notes}</p>
                </div>
              )}
              <div className="pt-2">
                <Badge variant="outline">{vehicles.length} veículo(s)</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
