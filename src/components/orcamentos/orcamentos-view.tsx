"use client";

import Link from "next/link";

import { QuotesListTable } from "@/components/orcamentos/quotes-list-table";
import { KanbanBoard, KanbanCard } from "@/components/shared/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildQuotePipelineColumns, type QuoteCard } from "@/lib/mock-data/quotes";
import { useErpDataStore } from "@/stores/erp-data-store";

type OrcamentosViewProps = {
  initialStatus?: string;
};

export function OrcamentosView({ initialStatus }: OrcamentosViewProps) {
  const quotes = useErpDataStore((state) => state.quotes);
  const columns = buildQuotePipelineColumns(quotes);

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
          renderCard={(item) => <QuoteKanbanCard quote={item} />}
        />
      </TabsContent>

      <TabsContent value="lista">
        <QuotesListTable quotes={quotes} initialStatus={initialStatus} />
      </TabsContent>
    </Tabs>
  );
}

function QuoteKanbanCard({ quote }: { quote: QuoteCard }) {
  return (
    <Link href={`/orcamentos/${quote.code.toLowerCase()}`} className="contents">
      <KanbanCard className="cursor-pointer">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium">{quote.code}</span>
          <span className="text-muted-foreground text-xs">{quote.updatedAt}</span>
        </div>
        <p className="font-medium">{quote.client}</p>
        <p className="text-muted-foreground text-xs">{quote.vehicle}</p>
        <p className="font-heading text-sm font-semibold">{quote.value}</p>
      </KanbanCard>
    </Link>
  );
}
