"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MessageCircle, Pencil, Printer } from "lucide-react";

import { ServiceOrderEditDialog } from "@/components/ordens-servico/service-order-edit-dialog";
import { ServiceOrderStatusActions } from "@/components/ordens-servico/service-order-status-actions";
import { ChecklistCard } from "@/components/shared/checklist-card";
import { DocumentActions } from "@/components/shared/document-actions";
import { EntityHeader } from "@/components/shared/entity-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Timeline, type TimelineEntry } from "@/components/shared/timeline";
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
import { getClientById } from "@/lib/mock-data/clients";
import { getEventsForEntity, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { downloadPdf, printPdf } from "@/lib/pdf/pdf-utils";
import { buildServiceOrderPdf } from "@/lib/pdf/service-order-pdf";
import { buildWarrantyPdf } from "@/lib/pdf/warranty-pdf";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import {
  calculateServiceOrderTotal,
  getWarrantyEndDate,
  type ChecklistItem,
  type ServiceOrder,
  type ServiceOrderStatus,
} from "@/lib/mock-data/service-orders-data";
import { getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { buildDocumentWhatsappMessage, openWhatsapp } from "@/lib/whatsapp";
import { useErpDataStore } from "@/stores/erp-data-store";

type ServiceOrderDetailClientProps = {
  order: ServiceOrder;
};

export function ServiceOrderDetailClient({ order }: ServiceOrderDetailClientProps) {
  const storeOrder = useErpDataStore((state) =>
    state.serviceOrders.find((item) => item.id === order.id),
  );
  const status = storeOrder?.status ?? order.status;
  const technicianId = storeOrder?.technicianId ?? order.technicianId;
  const statusHistory = storeOrder?.statusHistory ?? [];
  const changeServiceOrderStatus = useErpDataStore((state) => state.changeServiceOrderStatus);
  const setServiceOrderTechnician = useErpDataStore((state) => state.setServiceOrderTechnician);
  const quote = useErpDataStore((state) =>
    order.quoteId ? state.quotes.find((item) => item.id === order.quoteId) : undefined,
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(order.checklist);
  const [photos, setPhotos] = useState(order.photos);
  const [editOpen, setEditOpen] = useState(false);
  const technicians = useErpDataStore((state) => state.technicians);
  const getTechnicianName = (id: string) =>
    technicians.find((technician) => technician.id === id)?.name;

  const currentOrder = storeOrder ?? order;
  const isEditable = status !== "entregue" && status !== "cancelado";

  const storeEvents = useErpDataStore((state) => state.events);
  const client = getClientById(order.clientId);
  const vehicle = getVehicleById(order.vehicleId);
  const total = calculateServiceOrderTotal(currentOrder.items);
  const events = getEventsForEntity(storeEvents, "service_order", order.id).map(
    mapEntityEventToTimelineEntry,
  );
  const statusHistoryEntries: TimelineEntry[] = statusHistory.map((event) => ({
    id: event.id,
    title: `${SERVICE_ORDER_STATUS_META[event.from as ServiceOrderStatus]?.title ?? event.from} → ${SERVICE_ORDER_STATUS_META[event.to as ServiceOrderStatus]?.title ?? event.to}`,
    description: event.reason,
    timestamp: event.timestamp,
    author: event.user,
    variant: SERVICE_ORDER_STATUS_META[event.to as ServiceOrderStatus]?.variant,
  }));

  const photosAntes = photos.filter((photo) => photo.tag === "antes");
  const photosDepois = photos.filter((photo) => photo.tag === "depois");

  function toggleChecklistItem(id: string, done: boolean) {
    setChecklist((current) => current.map((item) => (item.id === id ? { ...item, done } : item)));
  }

  function handleExportPdf() {
    downloadPdf(buildServiceOrderPdf(currentOrder, client, vehicle), `${currentOrder.code}.pdf`);
  }

  function handlePrint() {
    printPdf(buildServiceOrderPdf(currentOrder, client, vehicle));
  }

  function handleExportWarrantyPdf() {
    downloadPdf(
      buildWarrantyPdf(currentOrder, client, vehicle),
      `${currentOrder.code}-garantia.pdf`,
    );
  }

  function handlePrintWarranty() {
    printPdf(buildWarrantyPdf(currentOrder, client, vehicle));
  }

  function handleSendWhatsapp() {
    const message = buildDocumentWhatsappMessage({
      clientName: client?.name ?? "cliente",
      code: currentOrder.code,
      total,
    });
    openWhatsapp(client?.whatsapp ?? client?.phone, message);
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={client?.name ?? "Cliente não encontrado"}
        code={order.code}
        status={{
          label: SERVICE_ORDER_STATUS_META[status].title,
          variant: SERVICE_ORDER_STATUS_META[status].variant,
        }}
        description={vehicle ? getVehicleLabel(vehicle) : "Veículo não encontrado"}
        backHref="/ordens-servico"
        actions={
          <>
            <DocumentActions onExportPdf={handleExportPdf} onPrint={handlePrint} />
            <Button variant="outline" onClick={handleExportWarrantyPdf}>
              <FileText />
              Termo de Garantia
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrintWarranty}>
              <Printer />
            </Button>
            <Button variant="outline" onClick={handleSendWhatsapp}>
              <MessageCircle />
              Enviar por WhatsApp
            </Button>
            {isEditable && (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil />
                Editar OS
              </Button>
            )}
            <ServiceOrderStatusActions
              order={order}
              status={status}
              technicianId={technicianId}
              onStatusChange={(newStatus) => changeServiceOrderStatus(order.id, newStatus)}
              onTechnicianChange={(newTechnicianId) =>
                setServiceOrderTechnician(order.id, newTechnicianId)
              }
            />
          </>
        }
      />

      <ServiceOrderEditDialog open={editOpen} onOpenChange={setEditOpen} order={currentOrder} />

      <div className="grid min-w-0 gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens / Serviços</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Valor unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="font-heading flex justify-between gap-8 self-end text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>

          <ChecklistCard items={checklist} onItemToggle={toggleChecklistItem} groupByCategory />

          <Card>
            <CardHeader>
              <CardTitle>Apontamentos de horas</CardTitle>
            </CardHeader>
            <CardContent>
              {order.timeLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum apontamento registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.timeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {getTechnicianName(log.technicianId) ?? "Não atribuído"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.description}</TableCell>
                        <TableCell className="text-right">{log.hours}h</TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {formatDate(log.date)}
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
              <CardTitle>Fotos — Antes</CardTitle>
            </CardHeader>
            <CardContent>
              <FileDropzone
                files={photosAntes}
                onFilesChange={(newFiles) =>
                  setPhotos([...photos.filter((photo) => photo.tag !== "antes"), ...newFiles])
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotos — Depois</CardTitle>
            </CardHeader>
            <CardContent>
              <FileDropzone
                files={photosDepois}
                onFilesChange={(newFiles) =>
                  setPhotos([...photos.filter((photo) => photo.tag !== "depois"), ...newFiles])
                }
              />
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

          <Card>
            <CardHeader>
              <CardTitle>Histórico de status</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline
                entries={statusHistoryEntries}
                emptyMessage="Nenhuma alteração manual de status registrada."
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
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
                  <p className="text-muted-foreground">{client.email}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Cliente não encontrado.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Veículo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              {vehicle ? (
                <>
                  <Link href={`/veiculos/${vehicle.id}`} className="font-medium hover:underline">
                    {getVehicleLabel(vehicle)}
                  </Link>
                  <p className="text-muted-foreground">Placa: {vehicle.plate}</p>
                  <p className="text-muted-foreground">Cor: {vehicle.color}</p>
                  <p className="text-muted-foreground">
                    KM: {vehicle.mileage.toLocaleString("pt-BR")}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Veículo não encontrado.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origem</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {quote ? (
                <>
                  <p className="text-muted-foreground">Gerada a partir do orçamento</p>
                  <Link
                    href={`/orcamentos/${quote.code.toLowerCase()}`}
                    className="font-medium hover:underline"
                  >
                    {quote.code}
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">
                  OS criada diretamente, sem orçamento de origem.
                </p>
              )}
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">Criada em</span>
                <span>{formatDateTime(currentOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizada em</span>
                <span>{formatDateTime(currentOrder.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previsão de entrega</span>
                <span>{formatDate(currentOrder.dueDate)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entrega e Garantia</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data da entrega</span>
                <span>{currentOrder.deliveredAt ? formatDate(currentOrder.deliveredAt) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KM na entrega</span>
                <span>
                  {currentOrder.deliveryMileage !== undefined
                    ? `${currentOrder.deliveryMileage.toLocaleString("pt-BR")} km`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Garantia</span>
                <span>
                  {currentOrder.warrantyPeriod !== undefined
                    ? `${currentOrder.warrantyPeriod} dias`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Garantia válida até</span>
                <span>
                  {currentOrder.deliveredAt && currentOrder.warrantyPeriod !== undefined
                    ? formatDate(
                        getWarrantyEndDate(currentOrder.deliveredAt, currentOrder.warrantyPeriod),
                      )
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {currentOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{currentOrder.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
