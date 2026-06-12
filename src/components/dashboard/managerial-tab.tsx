"use client";

import {
  CheckCircle2,
  DollarSign,
  PiggyBank,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { KpiCard } from "@/components/shared/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
  getManagerialKpis,
  getRevenueByPaymentMethodKpis,
  REVENUE_BY_CATEGORY,
} from "@/lib/mock-data/dashboard";
import { MONTHLY_REVENUE_TREND } from "@/lib/mock-data/financeiro";
import { formatCurrency } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

const MANAGERIAL_ICONS = [
  DollarSign,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Wallet,
  TrendingDown,
  PiggyBank,
];

export function ManagerialTab() {
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const receivables = useErpDataStore((state) => state.receivables);
  const payables = useErpDataStore((state) => state.payables);

  const managerialKpis = getManagerialKpis(quotes, serviceOrders, receivables, payables);
  const revenueByMethod = getRevenueByPaymentMethodKpis(receivables);
  const maxRevenue = Math.max(...MONTHLY_REVENUE_TREND.map((point) => point.receita));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {managerialKpis.map((kpi, index) => (
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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento x Despesas</CardTitle>
            <CardDescription>Evolução mensal (valores mockados)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-3">
              {MONTHLY_REVENUE_TREND.map((point) => (
                <div key={point.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-40 w-full items-end gap-1">
                    <div
                      className="bg-primary flex-1 rounded-t-sm"
                      style={{ height: `${(point.receita / maxRevenue) * 100}%` }}
                      title={`Receita: ${point.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                    />
                    <div
                      className="bg-muted-foreground/40 flex-1 rounded-t-sm"
                      style={{ height: `${(point.despesas / maxRevenue) * 100}%` }}
                      title={`Despesas: ${point.despesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                    />
                  </div>
                  <span className="text-muted-foreground text-xs">{point.month}</span>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="bg-primary inline-block size-2.5 rounded-sm" /> Receita
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-muted-foreground/40 inline-block size-2.5 rounded-sm" />{" "}
                Despesas
              </span>
            </div>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Receita por forma de pagamento</CardTitle>
            <CardDescription>Recebimentos do mês de referência, por forma</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {revenueByMethod.every((item) => item.value === 0) ? (
              <p className="text-muted-foreground text-sm">
                Nenhum recebimento registrado no mês de referência.
              </p>
            ) : (
              revenueByMethod
                .filter((item) => item.value > 0)
                .map((item) => (
                  <Progress key={item.method} value={item.percentage} className="gap-1.5">
                    <div className="flex w-full items-center justify-between">
                      <ProgressLabel>{item.label}</ProgressLabel>
                      <span className="text-muted-foreground ml-auto text-sm tabular-nums">
                        {formatCurrency(item.value)} ({item.percentage}%)
                      </span>
                    </div>
                  </Progress>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
