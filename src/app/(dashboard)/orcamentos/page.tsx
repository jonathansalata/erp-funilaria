import Link from "next/link";
import { Plus } from "lucide-react";

import { QuotesListTable } from "@/components/orcamentos/quotes-list-table";
import { KanbanBoard, KanbanCard } from "@/components/shared/kanban-board";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QUOTE_PIPELINE_COLUMNS, type QuoteCard } from "@/lib/mock-data/quotes";
import { QUOTES } from "@/lib/mock-data/quotes-data";

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Pipeline de Orçamentos</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe os orçamentos por etapa, do rascunho à aprovação do cliente.
          </p>
        </div>
        <Button render={<Link href="/orcamentos/novo" />}>
          <Plus />
          Novo orçamento
        </Button>
      </div>

      <Tabs defaultValue={status ? "lista" : "pipeline"}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <KanbanBoard
            columns={QUOTE_PIPELINE_COLUMNS}
            getItemId={(item) => item.id}
            renderCard={(item) => <QuoteKanbanCard quote={item} />}
          />
        </TabsContent>

        <TabsContent value="lista">
          <QuotesListTable quotes={QUOTES} initialStatus={status} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuoteKanbanCard({ quote }: { quote: QuoteCard }) {
  return (
    <Link href={`/orcamentos/${quote.id}`} className="contents">
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
