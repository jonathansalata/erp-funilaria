"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ServiceOrdersListTable } from "@/components/ordens-servico/service-orders-list-table";
import { KanbanBoard, KanbanCard } from "@/components/shared/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildServiceOrderPipelineColumns,
  type ServiceOrderCard,
} from "@/lib/mock-data/service-orders";
import { useErpDataStore } from "@/stores/erp-data-store";

type OrdensServicoViewProps = {
  initialStatus?: string;
};

export function OrdensServicoView({ initialStatus }: OrdensServicoViewProps) {
  const serviceOrders = useErpDataStore((state) => state.serviceOrders);
  const quotes = useErpDataStore((state) => state.quotes);
  const columns = buildServiceOrderPipelineColumns(serviceOrders, quotes);

  return (
    <Tabs defaultValue={initialStatus ? "lista" : "pipeline"}>
      <TabsList>
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="lista">Lista</TabsTrigger>
      </TabsList>

      <TabsContent value="pipeline">
        <KanbanBoard
          columns={columns}
          getItemId={(item) => item.id}
          renderCard={(item) => <ServiceOrderKanbanCard order={item} />}
        />
      </TabsContent>

      <TabsContent value="lista">
        <ServiceOrdersListTable
          orders={serviceOrders}
          quotes={quotes}
          initialStatus={initialStatus}
        />
      </TabsContent>
    </Tabs>
  );
}

function ServiceOrderKanbanCard({ order }: { order: ServiceOrderCard }) {
  const router = useRouter();

  return (
    <KanbanCard
      className="cursor-pointer"
      onClick={() => router.push(`/ordens-servico/${order.id}`)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">{order.code}</span>
        <span className="text-muted-foreground text-xs">{order.dueDate}</span>
      </div>
      {order.quoteCode && order.quoteId && (
        <Link
          href={`/orcamentos/${order.quoteId}`}
          className="text-primary text-xs hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          Origem: {order.quoteCode}
        </Link>
      )}
      <p className="font-medium">{order.client}</p>
      <p className="text-muted-foreground text-xs">{order.vehicle}</p>
      <p className="text-muted-foreground text-xs">Técnico: {order.technician}</p>
    </KanbanCard>
  );
}
