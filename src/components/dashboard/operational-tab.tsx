"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ClipboardCheck, Receipt, Wrench } from "lucide-react";

import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPOINTMENT_TYPE_META,
  getTodayDeliveries,
  getUpcomingAppointments,
} from "@/lib/mock-data/appointments";
import {
  getOperationalKpis,
  getRecentQuotes,
  getUpcomingDeliveries,
  getVehicleJourneySummary,
} from "@/lib/mock-data/dashboard";
import { getRecentEvents, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";
import { useErpDataStore } from "@/stores/erp-data-store";

const OPERATIONAL_ICONS = [Wrench, ClipboardCheck, Receipt, CalendarClock];

export function OperationalTab() {
  const router = useRouter();
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const vehicles = useErpDataStore((state) => state.vehicles);
  const events = useErpDataStore((state) => state.events);
  const appointments = useErpDataStore((state) => state.appointments);

  const operationalKpis = getOperationalKpis(quotes, serviceOrders);
  const upcomingDeliveries = getUpcomingDeliveries(serviceOrders, quotes);
  const recentQuotes = getRecentQuotes(quotes);
  const vehicleJourneySummary = getVehicleJourneySummary(vehicles);
  const recentActivity = getRecentEvents(events, 6).map(mapEntityEventToTimelineEntry);
  const upcomingAppointments = getUpcomingAppointments(appointments, 5);
  const todayDeliveries = getTodayDeliveries(appointments);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {operationalKpis.map((kpi, index) =>
          kpi.href ? (
            <Link key={kpi.title} href={kpi.href} className="transition-opacity hover:opacity-80">
              <KpiCard
                title={kpi.title}
                value={kpi.value}
                description={kpi.description}
                icon={OPERATIONAL_ICONS[index]}
              />
            </Link>
          ) : (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              description={kpi.description}
              icon={OPERATIONAL_ICONS[index]}
            />
          ),
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Pátio — Jornada do veículo</CardTitle>
            <CardDescription>Veículos na oficina por etapa atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {vehicleJourneySummary.map((stage) => (
                <div
                  key={stage.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2.5"
                >
                  <StatusBadge variant={stage.variant}>{stage.label}</StatusBadge>
                  <span className="font-heading text-lg font-semibold">{stage.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas entregas</CardTitle>
            <CardDescription>Veículos com entrega prevista</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcomingDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/ordens-servico/${delivery.code.toLowerCase()}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter")
                    router.push(`/ordens-servico/${delivery.code.toLowerCase()}`);
                }}
                className="border-border hover:bg-muted/50 flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{delivery.client}</span>
                  <StatusBadge variant={delivery.status.variant}>
                    {delivery.status.label}
                  </StatusBadge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {delivery.vehicle} · {delivery.code}
                </p>
                {delivery.quoteCode && delivery.quoteId && (
                  <Link
                    href={`/orcamentos/${delivery.quoteCode?.toLowerCase()}`}
                    className="text-primary text-xs hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Origem: {delivery.quoteCode}
                  </Link>
                )}
                <p className="text-muted-foreground text-xs">{delivery.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos compromissos</CardTitle>
            <CardDescription>
              Agenda de entregas, vistorias, retornos e atendimentos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum compromisso agendado.</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/agenda")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") router.push("/agenda");
                  }}
                  className="border-border hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{appointment.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {appointment.date} · {appointment.time}
                    </span>
                  </div>
                  <StatusBadge variant={APPOINTMENT_TYPE_META[appointment.type].variant}>
                    {APPOINTMENT_TYPE_META[appointment.type].label}
                  </StatusBadge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregas do dia</CardTitle>
            <CardDescription>Veículos com entrega agendada para hoje</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {todayDeliveries.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma entrega agendada para hoje.</p>
            ) : (
              todayDeliveries.map((appointment) => (
                <div
                  key={appointment.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push("/agenda")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") router.push("/agenda");
                  }}
                  className="border-border hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{appointment.title}</span>
                    {appointment.notes && (
                      <span className="text-muted-foreground text-xs">{appointment.notes}</span>
                    )}
                  </div>
                  <span className="font-heading text-sm font-semibold">{appointment.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orçamentos recentes</CardTitle>
          <CardDescription>Últimas atualizações na pipeline de orçamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/orcamentos/${quote.code.toLowerCase()}`}
                      className="hover:underline"
                    >
                      {quote.code}
                    </Link>
                  </TableCell>
                  <TableCell>{quote.client}</TableCell>
                  <TableCell className="text-muted-foreground">{quote.vehicle}</TableCell>
                  <TableCell>{quote.value}</TableCell>
                  <TableCell>
                    <StatusBadge variant={quote.status.variant}>{quote.status.label}</StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade recente</CardTitle>
          <CardDescription>Últimas movimentações em orçamentos, OS e vistorias</CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline entries={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
