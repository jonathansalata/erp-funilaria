import { AlertCircle, DollarSign, Percent, Receipt } from "lucide-react";

import { OperationalTab } from "@/components/dashboard/operational-tab";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MANAGERIAL_KPIS, REVENUE_BY_CATEGORY } from "@/lib/mock-data/dashboard";

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
          <OperationalTab />
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
