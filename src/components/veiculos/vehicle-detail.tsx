"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FileText, Pencil, Power, Receipt, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DocumentActions } from "@/components/shared/document-actions";
import { EntityHeader } from "@/components/shared/entity-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleEditDialog } from "@/components/veiculos/vehicle-edit-dialog";
import type { Client } from "@/lib/mock-data/clients";
import {
  canDeleteVehicle,
  getVehicleFinancialSummary,
  getVehicleSummary,
} from "@/lib/mock-data/crm";
import {
  type EntityEvent,
  getVehicleTimeline,
  mapEntityEventToTimelineEntry,
} from "@/lib/mock-data/entity-events";
import type { Receivable } from "@/lib/mock-data/financeiro";
import { INSPECTION_STATUS_META, type Inspection } from "@/lib/mock-data/inspections";
import { downloadPdf, printPdf } from "@/lib/pdf/pdf-utils";
import { buildVehiclePdf } from "@/lib/pdf/vehicle-pdf";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal, type Quote } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { calculateServiceOrderTotal, type ServiceOrder } from "@/lib/mock-data/service-orders-data";
import {
  FUEL_TYPE_LABELS,
  JOURNEY_STAGE_META,
  VEHICLE_STATUS_META,
  getVehicleLabel,
  type Vehicle,
} from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehicleDetailProps = {
  vehicle: Vehicle;
  client?: Client;
  inspections: Inspection[];
  quotes: Quote[];
  serviceOrders: ServiceOrder[];
  receivables: Receivable[];
  events: EntityEvent[];
};

export function VehicleDetail({
  vehicle,
  client,
  inspections,
  quotes,
  serviceOrders,
  receivables,
  events: storeEvents,
}: VehicleDetailProps) {
  const router = useRouter();
  const changeVehicleStatus = useErpDataStore((state) => state.changeVehicleStatus);
  const deleteVehicle = useErpDataStore((state) => state.deleteVehicle);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const events = getVehicleTimeline(storeEvents, vehicle.id).map(mapEntityEventToTimelineEntry);
  const financialSummary = getVehicleFinancialSummary(
    vehicle.id,
    quotes,
    serviceOrders,
    receivables,
  );
  const summary = getVehicleSummary(vehicle, quotes, serviceOrders);
  const statusMeta = VEHICLE_STATUS_META[vehicle.status];

  function buildPdfDocument() {
    return buildVehiclePdf(
      vehicle,
      client,
      inspections,
      quotes,
      serviceOrders,
      summary,
      financialSummary,
    );
  }

  function handleExportPdf() {
    downloadPdf(buildPdfDocument(), `${vehicle.code}.pdf`);
  }

  function handlePrint() {
    printPdf(buildPdfDocument());
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={getVehicleLabel(vehicle)}
        code={vehicle.code}
        status={{ label: statusMeta.label, variant: statusMeta.variant }}
        description={`Placa: ${vehicle.plate}`}
        backHref={client ? `/clientes/${client.id}` : "/veiculos"}
        actions={
          <>
            <DocumentActions onExportPdf={handleExportPdf} onPrint={handlePrint} />
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                changeVehicleStatus(vehicle.id, vehicle.status === "ativo" ? "inativo" : "ativo")
              }
            >
              <Power />
              {vehicle.status === "ativo" ? "Inativar" : "Ativar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!canDeleteVehicle(vehicle.id, quotes, serviceOrders, inspections)) {
                  toast.error(
                    "Este veículo possui vistoria, orçamento ou OS vinculado. Apenas a inativação é permitida.",
                  );
                  return;
                }
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 />
              Excluir
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total de orçamentos" value={String(summary.totalQuotes)} icon={FileText} />
        <KpiCard title="Total de OS" value={String(summary.totalServiceOrders)} icon={Wrench} />
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
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Veículo</CardTitle>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chassi</span>
                <span>{vehicle.chassi ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Renavam</span>
                <span>{vehicle.renavam ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Combustível</span>
                <span>{vehicle.fuel ? FUEL_TYPE_LABELS[vehicle.fuel] : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jornada atual</span>
                <span>
                  {vehicle.journeyStage ? (
                    <StatusBadge variant={JOURNEY_STAGE_META[vehicle.journeyStage].variant}>
                      {JOURNEY_STAGE_META[vehicle.journeyStage].label}
                    </StatusBadge>
                  ) : (
                    "Fora do pátio"
                  )}
                </span>
              </div>
              {vehicle.notes && (
                <div className="flex flex-col gap-1 pt-2 sm:col-span-2">
                  <span className="text-muted-foreground">Observações</span>
                  <p>{vehicle.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vistorias</CardTitle>
            </CardHeader>
            <CardContent>
              {inspections.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma vistoria registrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspections.map((inspection) => (
                      <TableRow
                        key={inspection.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/vistorias/${inspection.id}`)}
                      >
                        <TableCell className="font-medium">{inspection.code}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(inspection.createdAt)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge variant={INSPECTION_STATUS_META[inspection.status].variant}>
                            {INSPECTION_STATUS_META[inspection.status].title}
                          </StatusBadge>
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
              {quotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum orçamento registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow
                        key={quote.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/orcamentos/${quote.id}`)}
                      >
                        <TableCell className="font-medium">{quote.code}</TableCell>
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
                    ))}
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
              {serviceOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma ordem de serviço registrada.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Previsão</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/ordens-servico/${order.id}`)}
                      >
                        <TableCell className="font-medium">{order.code}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline do Veículo</CardTitle>
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

      <VehicleEditDialog open={isEditOpen} onOpenChange={setIsEditOpen} vehicle={vehicle} />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          deleteVehicle(vehicle.id);
          toast.success("Veículo excluído com sucesso.");
          router.push(client ? `/clientes/${client.id}` : "/veiculos");
        }}
        itemLabel={`o veículo ${vehicle.plate}`}
      />
    </div>
  );
}
