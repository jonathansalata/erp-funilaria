import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  Percent,
  Receipt,
  Wrench,
} from "lucide-react";

import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MANAGERIAL_KPIS,
  OPERATIONAL_KPIS,
  RECENT_QUOTES,
  REVENUE_BY_CATEGORY,
  UPCOMING_DELIVERIES,
  VEHICLE_JOURNEY_SUMMARY,
} from "@/lib/mock-data/dashboard";
import { getRecentEvents, mapEntityEventToTimelineEntry } from "@/lib/mock-data/entity-events";

const RECENT_ACTIVITY = getRecentEvents(6).map(mapEntityEventToTimelineEntry);

const OPERATIONAL_ICONS = [Wrench, ClipboardCheck, Receipt, CalendarClock];
const MANAGERIAL_ICONS = [DollarSign, Receipt, Percent, AlertCircle];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral da operação e dos indicadores de gestão da oficina.
        </p>
      </div>

      <Tabs defaultValue="operacional">
        <TabsList>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="gerencial">Gerencial</TabsTrigger>
        </TabsList>

        <TabsContent value="operacional" className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {OPERATIONAL_KPIS.map((kpi, index) =>
              kpi.href ? (
                <Link
                  key={kpi.title}
                  href={kpi.href}
                  className="transition-opacity hover:opacity-80"
                >
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
                  {VEHICLE_JOURNEY_SUMMARY.map((stage) => (
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
                {UPCOMING_DELIVERIES.map((delivery) => (
                  <Link
                    key={delivery.id}
                    href={`/ordens-servico/${delivery.id}`}
                    className="border-border hover:bg-muted/50 flex flex-col gap-1 rounded-lg border px-3 py-2.5 transition-colors"
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
                    <p className="text-muted-foreground text-xs">{delivery.time}</p>
                  </Link>
                ))}
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
                  {RECENT_QUOTES.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">
                        <Link href={`/orcamentos/${quote.id}`} className="hover:underline">
                          {quote.code}
                        </Link>
                      </TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell className="text-muted-foreground">{quote.vehicle}</TableCell>
                      <TableCell>{quote.value}</TableCell>
                      <TableCell>
                        <StatusBadge variant={quote.status.variant}>
                          {quote.status.label}
                        </StatusBadge>
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
              <Timeline entries={RECENT_ACTIVITY} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gerencial" className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {MANAGERIAL_KPIS.map((kpi, index) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                description={kpi.description}
                trend={kpi.trend}
                icon={MANAGERIAL_ICONS[index]}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Faturamento por categoria</CardTitle>
              <CardDescription>Participação de cada categoria no mês atual</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {REVENUE_BY_CATEGORY.map((category) => (
                <Progress key={category.category} value={category.percentage} className="gap-1.5">
                  <div className="flex w-full items-center justify-between">
                    <ProgressLabel>{category.category}</ProgressLabel>
                    <span className="text-muted-foreground ml-auto text-sm tabular-nums">
                      {category.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </Progress>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
