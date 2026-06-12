"use client";

import { useState } from "react";
import Link from "next/link";

import { QuoteStatusActions } from "@/components/orcamentos/quote-status-actions";
import { EntityHeader } from "@/components/shared/entity-header";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Timeline, type TimelineEntry } from "@/components/shared/timeline";
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
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import {
  QUOTE_CATEGORY_LABELS,
  calculateQuoteTotal,
  type Quote,
  type QuoteStatus,
} from "@/lib/mock-data/quotes-data";
import { getVehicleById, getVehicleLabel } from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

type QuoteDetailClientProps = {
  quote: Quote;
};

export function QuoteDetailClient({ quote }: QuoteDetailClientProps) {
  const storeQuote = useErpDataStore((state) => state.quotes.find((item) => item.id === quote.id));
  const status = storeQuote?.status ?? quote.status;
  const statusHistory = storeQuote?.statusHistory ?? [];
  const changeQuoteStatus = useErpDataStore((state) => state.changeQuoteStatus);
  const [attachments, setAttachments] = useState(quote.attachments);

  const storeEvents = useErpDataStore((state) => state.events);
  const client = getClientById(quote.clientId);
  const vehicle = getVehicleById(quote.vehicleId);
  const totals = calculateQuoteTotal(quote.items);
  const events = getEventsForEntity(storeEvents, "quote", quote.id).map(
    mapEntityEventToTimelineEntry,
  );
  const statusHistoryEntries: TimelineEntry[] = statusHistory.map((event) => ({
    id: event.id,
    title: `${QUOTE_STATUS_META[event.from as QuoteStatus]?.title ?? event.from} → ${QUOTE_STATUS_META[event.to as QuoteStatus]?.title ?? event.to}`,
    description: event.reason,
    timestamp: event.timestamp,
    author: event.user,
    variant: QUOTE_STATUS_META[event.to as QuoteStatus]?.variant,
  }));

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader
        title={client?.name ?? "Cliente não encontrado"}
        code={quote.code}
        status={{
          label: QUOTE_STATUS_META[status].title,
          variant: QUOTE_STATUS_META[status].variant,
        }}
        description={vehicle ? getVehicleLabel(vehicle) : "Veículo não encontrado"}
        backHref="/orcamentos"
        actions={
          <QuoteStatusActions
            quote={quote}
            status={status}
            onStatusChange={(newStatus) => changeQuoteStatus(quote.id, newStatus)}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do orçamento</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Valor unit.</TableHead>
                    <TableHead className="text-right">Desconto</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => {
                    const lineSubtotal = item.quantity * item.unitPrice;
                    const lineDiscount = item.discount ? (lineSubtotal * item.discount) / 100 : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {QUOTE_CATEGORY_LABELS[item.category]}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {item.discount ? `${item.discount}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(lineSubtotal - lineDiscount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-1 self-end text-sm">
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Descontos</span>
                  <span>-{formatCurrency(totals.discountTotal)}</span>
                </div>
                <div className="font-heading flex justify-between gap-8 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {quote.notes || "Nenhuma observação registrada."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              <FileDropzone files={attachments} onFilesChange={setAttachments} />
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

        <div className="flex flex-col gap-6">
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
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{formatCurrency(totals.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em</span>
                <span>{formatDateTime(quote.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizado em</span>
                <span>{formatDateTime(quote.updatedAt)}</span>
              </div>
              {quote.validUntil && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Válido até</span>
                  <span>{formatDate(quote.validUntil)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
