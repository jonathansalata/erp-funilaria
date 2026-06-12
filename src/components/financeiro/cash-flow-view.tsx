"use client";

import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";

import { KpiCard } from "@/components/shared/kpi-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCashFlowEntries, PAYABLE_CATEGORY_LABELS } from "@/lib/mock-data/financeiro";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

export function CashFlowView() {
  const receivables = useErpDataStore((state) => state.receivables);
  const payables = useErpDataStore((state) => state.payables);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [category, setCategory] = useState("all");

  const filteredPayables = useMemo(
    () => (category === "all" ? payables : payables.filter((item) => item.category === category)),
    [payables, category],
  );

  const entries = useMemo(() => {
    const all = getCashFlowEntries(receivables, filteredPayables);
    return all.filter((entry) => {
      if (dateFrom && entry.date < dateFrom) return false;
      if (dateTo && entry.date > dateTo) return false;
      return true;
    });
  }, [receivables, filteredPayables, dateFrom, dateTo]);

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, entry) => ({
          inflow: acc.inflow + entry.inflow,
          outflow: acc.outflow + entry.outflow,
        }),
        { inflow: 0, outflow: 0 },
      ),
    [entries],
  );

  const finalBalance = entries.length > 0 ? entries[entries.length - 1].accumulatedBalance : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Fluxo de Caixa</h1>
        <p className="text-muted-foreground text-sm">
          Movimentações diárias geradas a partir de Contas a Receber e Contas a Pagar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total de entradas"
          value={formatCurrency(totals.inflow)}
          icon={ArrowUpCircle}
          description="Recebimentos no período"
        />
        <KpiCard
          title="Total de saídas"
          value={formatCurrency(totals.outflow)}
          icon={ArrowDownCircle}
          description="Pagamentos no período"
        />
        <KpiCard
          title="Saldo acumulado"
          value={formatCurrency(finalBalance)}
          icon={Scale}
          description="Saldo no final do período"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cashflow-from">De</Label>
          <Input
            id="cashflow-from"
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cashflow-to">Até</Label>
          <Input
            id="cashflow-to"
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cashflow-category">Categoria (saídas)</Label>
          <Select value={category} onValueChange={(value) => value && setCategory(value as string)}>
            <SelectTrigger id="cashflow-category" className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(PAYABLE_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Entradas</TableHead>
              <TableHead className="text-right">Saídas</TableHead>
              <TableHead className="text-right">Saldo diário</TableHead>
              <TableHead className="text-right">Saldo acumulado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.date}>
                  <TableCell className="font-medium">{formatDate(entry.date)}</TableCell>
                  <TableCell className="text-success text-right">
                    {entry.inflow > 0 ? formatCurrency(entry.inflow) : "—"}
                  </TableCell>
                  <TableCell className="text-destructive text-right">
                    {entry.outflow > 0 ? formatCurrency(entry.outflow) : "—"}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.dailyBalance)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.accumulatedBalance)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
