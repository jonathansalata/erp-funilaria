"use client";

import { ReportTable, type ReportColumn } from "@/components/relatorios/report-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLIENTS, getClientById, type Client } from "@/lib/mock-data/clients";
import {
  getPayablesSummary,
  getReceivablesSummary,
  PAYABLE_CATEGORY_LABELS,
  PAYABLE_STATUS_META,
  RECEIVABLE_STATUS_META,
  type Payable,
  type Receivable,
} from "@/lib/mock-data/financeiro";
import { INSPECTION_STATUS_META, type Inspection } from "@/lib/mock-data/inspections";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import { calculateQuoteTotal, type Quote } from "@/lib/mock-data/quotes-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { calculateServiceOrderTotal, type ServiceOrder } from "@/lib/mock-data/service-orders-data";
import { getTechnicianById } from "@/lib/mock-data/technicians";
import {
  getVehicleLabel,
  getVehicleLabelById,
  JOURNEY_STAGE_META,
  type Vehicle,
} from "@/lib/mock-data/vehicles";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useErpDataStore } from "@/stores/erp-data-store";

const CLIENT_TYPE_LABELS: Record<Client["type"], string> = {
  pessoa_fisica: "Pessoa física",
  pessoa_juridica: "Pessoa jurídica",
};

export function ReportsView() {
  const vehicles = useErpDataStore((state) => state.vehicles);
  const inspections = useErpDataStore((state) => state.inspections);
  const quotes = useErpDataStore((state) => state.quotes);
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const receivables = useErpDataStore((state) => state.receivables);
  const payables = useErpDataStore((state) => state.payables);

  const clientColumns: ReportColumn<Client>[] = [
    {
      id: "code",
      header: "Código",
      cell: (row) => row.code,
      csvHeader: "Código",
      csvValue: (row) => row.code,
      sortValue: (row) => row.code,
    },
    {
      id: "name",
      header: "Nome",
      cell: (row) => row.name,
      csvHeader: "Nome",
      csvValue: (row) => row.name,
      sortValue: (row) => row.name,
    },
    {
      id: "type",
      header: "Tipo",
      cell: (row) => CLIENT_TYPE_LABELS[row.type],
      csvHeader: "Tipo",
      csvValue: (row) => CLIENT_TYPE_LABELS[row.type],
    },
    {
      id: "document",
      header: "Documento",
      cell: (row) => row.document,
      csvHeader: "Documento",
      csvValue: (row) => row.document,
    },
    {
      id: "phone",
      header: "Telefone",
      cell: (row) => row.phone,
      csvHeader: "Telefone",
      csvValue: (row) => row.phone,
    },
    {
      id: "vehicles",
      header: "Veículos",
      cell: (row) => row.vehicleIds.length,
      csvHeader: "Qtd. veículos",
      csvValue: (row) => row.vehicleIds.length,
    },
  ];

  const vehicleColumns: ReportColumn<Vehicle>[] = [
    {
      id: "plate",
      header: "Placa",
      cell: (row) => row.plate,
      csvHeader: "Placa",
      csvValue: (row) => row.plate,
      sortValue: (row) => row.plate,
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (row) => getVehicleLabel(row),
      csvHeader: "Veículo",
      csvValue: (row) => getVehicleLabel(row),
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.clientId)?.name ?? "—",
    },
    {
      id: "mileage",
      header: "KM",
      cell: (row) => row.mileage.toLocaleString("pt-BR"),
      csvHeader: "KM",
      csvValue: (row) => row.mileage,
      sortValue: (row) => row.mileage,
    },
    {
      id: "stage",
      header: "Etapa do pátio",
      cell: (row) =>
        row.journeyStage ? (
          <StatusBadge variant={JOURNEY_STAGE_META[row.journeyStage].variant}>
            {JOURNEY_STAGE_META[row.journeyStage].label}
          </StatusBadge>
        ) : (
          "—"
        ),
      csvHeader: "Etapa do pátio",
      csvValue: (row) => (row.journeyStage ? JOURNEY_STAGE_META[row.journeyStage].label : "—"),
    },
  ];

  const inspectionColumns: ReportColumn<Inspection>[] = [
    {
      id: "code",
      header: "Código",
      cell: (row) => row.code,
      csvHeader: "Código",
      csvValue: (row) => row.code,
      sortValue: (row) => row.code,
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.clientId)?.name ?? "—",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (row) => getVehicleLabelById(row.vehicleId),
      csvHeader: "Veículo",
      csvValue: (row) => getVehicleLabelById(row.vehicleId),
    },
    {
      id: "createdAt",
      header: "Data",
      cell: (row) => formatDate(row.createdAt),
      csvHeader: "Data",
      csvValue: (row) => formatDate(row.createdAt),
      sortValue: (row) => row.createdAt,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={INSPECTION_STATUS_META[row.status].variant}>
          {INSPECTION_STATUS_META[row.status].title}
        </StatusBadge>
      ),
      csvHeader: "Status",
      csvValue: (row) => INSPECTION_STATUS_META[row.status].title,
    },
  ];

  const quoteColumns: ReportColumn<Quote>[] = [
    {
      id: "code",
      header: "Código",
      cell: (row) => row.code,
      csvHeader: "Código",
      csvValue: (row) => row.code,
      sortValue: (row) => row.code,
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.clientId)?.name ?? "—",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (row) => getVehicleLabelById(row.vehicleId),
      csvHeader: "Veículo",
      csvValue: (row) => getVehicleLabelById(row.vehicleId),
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(calculateQuoteTotal(row.items).total),
      csvHeader: "Valor",
      csvValue: (row) => calculateQuoteTotal(row.items).total,
      sortValue: (row) => calculateQuoteTotal(row.items).total,
      className: "text-right",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={QUOTE_STATUS_META[row.status].variant}>
          {QUOTE_STATUS_META[row.status].title}
        </StatusBadge>
      ),
      csvHeader: "Status",
      csvValue: (row) => QUOTE_STATUS_META[row.status].title,
    },
  ];

  const serviceOrderColumns: ReportColumn<ServiceOrder>[] = [
    {
      id: "code",
      header: "Código",
      cell: (row) => row.code,
      csvHeader: "Código",
      csvValue: (row) => row.code,
      sortValue: (row) => row.code,
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.clientId)?.name ?? "—",
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: (row) => getVehicleLabelById(row.vehicleId),
      csvHeader: "Veículo",
      csvValue: (row) => getVehicleLabelById(row.vehicleId),
    },
    {
      id: "technician",
      header: "Técnico",
      cell: (row) => getTechnicianById(row.technicianId)?.name ?? "—",
      csvHeader: "Técnico",
      csvValue: (row) => getTechnicianById(row.technicianId)?.name ?? "—",
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(calculateServiceOrderTotal(row.items)),
      csvHeader: "Valor",
      csvValue: (row) => calculateServiceOrderTotal(row.items),
      sortValue: (row) => calculateServiceOrderTotal(row.items),
      className: "text-right",
    },
    {
      id: "dueDate",
      header: "Previsão",
      cell: (row) => formatDate(row.dueDate),
      csvHeader: "Previsão de entrega",
      csvValue: (row) => formatDate(row.dueDate),
      sortValue: (row) => row.dueDate,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={SERVICE_ORDER_STATUS_META[row.status].variant}>
          {SERVICE_ORDER_STATUS_META[row.status].title}
        </StatusBadge>
      ),
      csvHeader: "Status",
      csvValue: (row) => SERVICE_ORDER_STATUS_META[row.status].title,
    },
  ];

  const receivableColumns: ReportColumn<Receivable>[] = [
    {
      id: "document",
      header: "Documento",
      cell: (row) => row.document,
      csvHeader: "Documento",
      csvValue: (row) => row.document,
      sortValue: (row) => row.document,
    },
    {
      id: "client",
      header: "Cliente",
      cell: (row) => getClientById(row.clientId)?.name ?? "—",
      csvHeader: "Cliente",
      csvValue: (row) => getClientById(row.clientId)?.name ?? "—",
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      csvHeader: "Valor",
      csvValue: (row) => row.value,
      sortValue: (row) => row.value,
      className: "text-right",
    },
    {
      id: "dueDate",
      header: "Vencimento",
      cell: (row) => formatDate(row.dueDate),
      csvHeader: "Vencimento",
      csvValue: (row) => formatDate(row.dueDate),
      sortValue: (row) => row.dueDate,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={RECEIVABLE_STATUS_META[row.status].variant}>
          {RECEIVABLE_STATUS_META[row.status].label}
        </StatusBadge>
      ),
      csvHeader: "Status",
      csvValue: (row) => RECEIVABLE_STATUS_META[row.status].label,
    },
  ];

  const payableColumns: ReportColumn<Payable>[] = [
    {
      id: "supplier",
      header: "Fornecedor",
      cell: (row) => row.supplier,
      csvHeader: "Fornecedor",
      csvValue: (row) => row.supplier,
      sortValue: (row) => row.supplier,
    },
    {
      id: "category",
      header: "Categoria",
      cell: (row) => PAYABLE_CATEGORY_LABELS[row.category],
      csvHeader: "Categoria",
      csvValue: (row) => PAYABLE_CATEGORY_LABELS[row.category],
    },
    {
      id: "value",
      header: "Valor",
      cell: (row) => formatCurrency(row.value),
      csvHeader: "Valor",
      csvValue: (row) => row.value,
      sortValue: (row) => row.value,
      className: "text-right",
    },
    {
      id: "dueDate",
      header: "Vencimento",
      cell: (row) => formatDate(row.dueDate),
      csvHeader: "Vencimento",
      csvValue: (row) => formatDate(row.dueDate),
      sortValue: (row) => row.dueDate,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={PAYABLE_STATUS_META[row.status].variant}>
          {PAYABLE_STATUS_META[row.status].label}
        </StatusBadge>
      ),
      csvHeader: "Status",
      csvValue: (row) => PAYABLE_STATUS_META[row.status].label,
    },
  ];

  const receivablesSummary = getReceivablesSummary(receivables);
  const payablesSummary = getPayablesSummary(payables);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Relatórios</h1>
        <p className="text-muted-foreground text-sm">
          Relatórios operacionais e financeiros da oficina, com exportação em CSV.
        </p>
      </div>

      <Tabs defaultValue="clientes">
        <TabsList className="flex-wrap">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          <TabsTrigger value="vistorias">Vistorias</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="ordens-servico">Ordens de Serviço</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="pt-4">
          <ReportTable
            title="Clientes"
            description="Cadastro de clientes da oficina"
            data={CLIENTS}
            columns={clientColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar cliente..."
            searchFn={(row, query) =>
              row.name.toLowerCase().includes(query) || row.document.toLowerCase().includes(query)
            }
            filename="relatorio-clientes.csv"
          />
        </TabsContent>

        <TabsContent value="veiculos" className="pt-4">
          <ReportTable
            title="Veículos"
            description="Veículos cadastrados e etapa atual no pátio"
            data={vehicles}
            columns={vehicleColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar por placa..."
            searchFn={(row, query) => row.plate.toLowerCase().includes(query)}
            filename="relatorio-veiculos.csv"
          />
        </TabsContent>

        <TabsContent value="vistorias" className="pt-4">
          <ReportTable
            title="Vistorias"
            description="Vistorias registradas e seus status"
            data={inspections}
            columns={inspectionColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar vistoria..."
            searchFn={(row, query) => row.code.toLowerCase().includes(query)}
            filename="relatorio-vistorias.csv"
          />
        </TabsContent>

        <TabsContent value="orcamentos" className="pt-4">
          <ReportTable
            title="Orçamentos"
            description="Orçamentos emitidos para clientes"
            data={quotes}
            columns={quoteColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar orçamento..."
            searchFn={(row, query) => row.code.toLowerCase().includes(query)}
            filename="relatorio-orcamentos.csv"
          />
        </TabsContent>

        <TabsContent value="ordens-servico" className="pt-4">
          <ReportTable
            title="Ordens de Serviço"
            description="Ordens de serviço em andamento e concluídas"
            data={serviceOrders}
            columns={serviceOrderColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar OS..."
            searchFn={(row, query) => row.code.toLowerCase().includes(query)}
            filename="relatorio-ordens-servico.csv"
          />
        </TabsContent>

        <TabsContent value="financeiro" className="flex flex-col gap-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-muted-foreground rounded-xl border px-4 py-3 text-sm">
              <p className="text-foreground font-medium">Contas a Receber</p>
              <p>Total em aberto: {formatCurrency(receivablesSummary.totalAberto)}</p>
              <p>Recebido no mês: {formatCurrency(receivablesSummary.recebidoNoMes)}</p>
            </div>
            <div className="text-muted-foreground rounded-xl border px-4 py-3 text-sm">
              <p className="text-foreground font-medium">Contas a Pagar</p>
              <p>Total em aberto: {formatCurrency(payablesSummary.totalAberto)}</p>
              <p>Pago no mês: {formatCurrency(payablesSummary.pagoNoMes)}</p>
            </div>
          </div>

          <ReportTable
            title="Contas a Receber"
            description="Títulos a receber de clientes"
            data={receivables}
            columns={receivableColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar por documento..."
            searchFn={(row, query) => row.document.toLowerCase().includes(query)}
            filename="relatorio-contas-a-receber.csv"
          />

          <ReportTable
            title="Contas a Pagar"
            description="Contas a pagar a fornecedores e despesas"
            data={payables}
            columns={payableColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Buscar por fornecedor..."
            searchFn={(row, query) => row.supplier.toLowerCase().includes(query)}
            filename="relatorio-contas-a-pagar.csv"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
