"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Clock,
  DollarSign,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Receipt,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { ClientEditDialog } from "@/components/clientes/client-edit-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { EntityHeader } from "@/components/shared/entity-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleEditDialog } from "@/components/veiculos/vehicle-edit-dialog";
import { CLIENT_STATUS_META, CLIENT_TYPE_LABELS, type Client } from "@/lib/mock-data/clients";
import { canDeleteClient, getClientFinancialSummary, getClientSummary } from "@/lib/mock-data/crm";
import { getClientTimeline, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { calculateServiceOrderTotal } from "@/lib/mock-data/service-orders-data";
import { JOURNEY_STAGE_META, type Vehicle } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type ClientDetailProps = {
  client: Client;
};

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const storeVehicles = useErpDataStore((state) => state.vehicles);
  const storeEvents = useErpDataStore((state) => state.events);
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const receivables = useErpDataStore((state) => state.receivables);
  const changeClientStatus = useErpDataStore((state) => state.changeClientStatus);
  const changeVehicleStatus = useErpDataStore((state) => state.changeVehicleStatus);
  const deleteClient = useErpDataStore((state) => state.deleteClient);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();

  const vehicles = client.vehicleIds
    .map((id) => storeVehicles.find((vehicle) => vehicle.id === id))
    .filter((v): v is Vehicle => v !== undefined);

  const clientQuotes = quotes
    .filter((quote) => quote.clientId === client.id)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  const clientOrders = serviceOrders
    .filter((order) => order.clientId === client.id)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const summary = getClientSummary(client, quotes, serviceOrders);
  const financialSummary = getClientFinancialSummary(client.id, receivables);
  const events = getClientTimeline(storeEvents, client.id).map(mapEntityEventToTimelineEntry);
  const statusMeta = CLIENT_STATUS_META[client.status];

  function getVehicleDisplay(vehicleId: string) {
    return storeVehicles.find((vehicle) => vehicle.id === vehicleId);
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={client.name}
        code={client.code}
        status={{ label: statusMeta.label, variant: statusMeta.variant }}
        description={`${CLIENT_TYPE_LABELS[client.type]} · ${client.document} · ${client.phone} · ${client.email}`}
        backHref="/clientes"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                changeClientStatus(client.id, client.status === "ativo" ? "inativo" : "ativo")
              }
            >
              <Power />
              {client.status === "ativo" ? "Inativar" : "Ativar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!canDeleteClient(client.id, quotes, serviceOrders, receivables)) {
                  toast.error(
                    "Este cliente possui orçamento aprovado, OS ou financeiro vinculado. Apenas a inativação é permitida.",
                  );
                  return;
                }
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 />
              Excluir
            </Button>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total de veículos" value={String(summary.totalVehicles)} icon={Car} />
        <KpiCard title="Total de orçamentos" value={String(summary.totalQuotes)} icon={FileText} />
        <KpiCard title="Total de OS" value={String(summary.totalServiceOrders)} icon={Wrench} />
        <KpiCard
          title="Ticket médio"
          value={formatCurrency(summary.ticketMedio)}
          icon={DollarSign}
        />
        <KpiCard
          title="Valor total gasto"
          value={formatCurrency(summary.totalSpent)}
          icon={Receipt}
        />
        <KpiCard
          title="Última visita"
          value={summary.lastVisit ? formatDate(summary.lastVisit) : "-"}
          icon={Clock}
        />
        <KpiCard
          title="Dias sem retorno"
          value={summary.daysSinceLastVisit !== null ? String(summary.daysSinceLastVisit) : "-"}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Veículos vinculados</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum veículo cadastrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Status Atual</TableHead>
                      <TableHead>Última Entrada</TableHead>
                      <TableHead className="w-12">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow
                        key={vehicle.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                      >
                        <TableCell className="font-medium">{vehicle.plate}</TableCell>
                        <TableCell>{vehicle.brand}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell>
                          {vehicle.journeyStage ? (
                            <StatusBadge variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant}>
                              {JOURNEY_STAGE_META[vehicle.journeyStage].label}
                            </StatusBadge>
                          ) : (
                            <span className="text-muted-foreground">Fora do pátio</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vehicle.journeyStageUpdatedAt
                            ? formatDateTime(vehicle.journeyStageUpdatedAt)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <MoreHorizontal />
                                </Button>
                              }
                            />
                            <DropdownMenuContent
                              align="end"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <DropdownMenuItem
                                onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                              >
                                <Eye />
                                Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingVehicle(vehicle)}>
                                <Pencil />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeVehicleStatus(
                                    vehicle.id,
                                    vehicle.status === "ativo" ? "inativo" : "ativo",
                                  )
                                }
                              >
                                <Power />
                                {vehicle.status === "ativo" ? "Inativar" : "Ativar"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {clientQuotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum orçamento registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientQuotes.map((quote) => {
                      const vehicle = getVehicleDisplay(quote.vehicleId);
                      return (
                        <TableRow
                          key={quote.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/orcamentos/${quote.id}`)}
                        >
                          <TableCell className="font-medium">{quote.code}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(quote.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant={QUOTE_STATUS_META[quote.status].variant}>
                              {QUOTE_STATUS_META[quote.status].title}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(calculateQuoteTotal(quote.items).total)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              {clientOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma ordem de serviço registrada.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Previsão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientOrders.map((order) => {
                      const vehicle = getVehicleDisplay(order.vehicleId);
                      return (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/ordens-servico/${order.id}`)}
                        >
                          <TableCell className="font-medium">{order.code}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.dueDate)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant={SERVICE_ORDER_STATUS_META[order.status].variant}>
                              {SERVICE_ORDER_STATUS_META[order.status].title}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(calculateServiceOrderTotal(order.items))}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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
              <CardTitle>Dados do cliente</CardTitle>
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
                <span className="text-muted-foreground">Telefone</span>
                <span>{client.phone}</span>
              </div>
              {client.whatsapp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span>{client.whatsapp}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{client.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endereço</span>
                <span className="text-right">{client.address}</span>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total faturado</span>
                <span>{formatCurrency(financialSummary.totalFaturado)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total recebido</span>
                <span>{formatCurrency(financialSummary.totalRecebido)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo pendente</span>
                <span>{formatCurrency(financialSummary.saldoPendente)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último pagamento</span>
                <span>
                  {financialSummary.lastPaymentAt
                    ? formatDate(financialSummary.lastPaymentAt)
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ClientEditDialog open={isEditOpen} onOpenChange={setIsEditOpen} client={client} />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          deleteClient(client.id);
          toast.success("Cliente excluído com sucesso.");
          router.push("/clientes");
        }}
        itemLabel={`o cliente ${client.name}`}
      />

      <VehicleEditDialog
        open={Boolean(editingVehicle)}
        onOpenChange={(open) => !open && setEditingVehicle(undefined)}
        vehicle={editingVehicle}
      />
    </div>
  );
}
