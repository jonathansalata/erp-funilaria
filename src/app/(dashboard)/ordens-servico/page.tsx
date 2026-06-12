import Link from "next/link";

import { ServiceOrdersListTable } from "@/components/ordens-servico/service-orders-list-table";
import { KanbanBoard, KanbanCard } from "@/components/shared/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SERVICE_ORDER_PIPELINE_COLUMNS,
  type ServiceOrderCard,
} from "@/lib/mock-data/service-orders";
import { SERVICE_ORDERS } from "@/lib/mock-data/service-orders-data";

export default async function OrdensServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pipeline de Ordens de Serviço</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe a execução dos serviços, do início até a entrega ao cliente.
        </p>
      </div>

      <Tabs defaultValue={status ? "lista" : "pipeline"}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <KanbanBoard
            columns={SERVICE_ORDER_PIPELINE_COLUMNS}
            getItemId={(item) => item.id}
            renderCard={(item) => (
              <Link href={`/ordens-servico/${item.id}`} className="contents">
                <ServiceOrderKanbanCard order={item} />
              </Link>
            )}
          />
        </TabsContent>

        <TabsContent value="lista">
          <ServiceOrdersListTable orders={SERVICE_ORDERS} initialStatus={status} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ServiceOrderKanbanCard({ order }: { order: ServiceOrderCard }) {
  return (
    <KanbanCard className="cursor-pointer">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium">{order.code}</span>
        <span className="text-muted-foreground text-xs">{order.dueDate}</span>
      </div>
      <p className="font-medium">{order.client}</p>
      <p className="text-muted-foreground text-xs">{order.vehicle}</p>
      <p className="text-muted-foreground text-xs">Técnico: {order.technician}</p>
    </KanbanCard>
  );
}
