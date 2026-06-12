import { ManagerialTab } from "@/components/dashboard/managerial-tab";
import { OperationalTab } from "@/components/dashboard/operational-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <ManagerialTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
