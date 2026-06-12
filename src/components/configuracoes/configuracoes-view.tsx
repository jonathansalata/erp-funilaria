"use client";

import { AboutSystem } from "@/components/configuracoes/about-system";
import { BanksManager } from "@/components/configuracoes/banks-manager";
import { CatalogManager } from "@/components/configuracoes/catalog-manager";
import { ChecklistTemplatesManager } from "@/components/configuracoes/checklist-templates-manager";
import { CompanySettings } from "@/components/configuracoes/company-settings";
import { HelpCenter } from "@/components/configuracoes/help-center";
import { PaymentMethodsManager } from "@/components/configuracoes/payment-methods-manager";
import { StatusConfigManager } from "@/components/configuracoes/status-config-manager";
import { TechnicalLogsView } from "@/components/configuracoes/technical-logs-view";
import { TechniciansManager } from "@/components/configuracoes/technicians-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATALOG_META, type CatalogKey } from "@/lib/mock-data/settings";
import { useErpDataStore } from "@/stores/erp-data-store";

const CATALOG_KEYS: CatalogKey[] = [
  "services",
  "categories",
  "costCenters",
  "teams",
  "cancellationReasons",
  "refusalReasons",
  "observationTemplates",
];

export function ConfiguracoesView() {
  const quoteStatusConfigs = useErpDataStore((state) => state.quoteStatusConfigs);
  const serviceOrderStatusConfigs = useErpDataStore((state) => state.serviceOrderStatusConfigs);
  const updateQuoteStatusConfig = useErpDataStore((state) => state.updateQuoteStatusConfig);
  const updateServiceOrderStatusConfig = useErpDataStore(
    (state) => state.updateServiceOrderStatusConfig,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Toda informação reutilizável do ERP nasce aqui: serviços, categorias, status, formas de
          pagamento, bancos, centros de custo, técnicos, equipes, motivos, modelos de observação,
          dados da empresa e documentos.
        </p>
      </div>

      <Tabs defaultValue="catalogos">
        <TabsList className="flex-wrap">
          <TabsTrigger value="catalogos">Catálogos</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="pagamentos">Formas de Pagamento</TabsTrigger>
          <TabsTrigger value="bancos">Bancos</TabsTrigger>
          <TabsTrigger value="tecnicos">Técnicos</TabsTrigger>
          <TabsTrigger value="checklists">Templates de Checklist</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="ajuda">Ajuda</TabsTrigger>
          <TabsTrigger value="logs">Logs Técnicos</TabsTrigger>
          <TabsTrigger value="sobre">Sobre o Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogos" className="pt-4">
          <Tabs defaultValue={CATALOG_KEYS[0]} orientation="vertical">
            <TabsList variant="line" className="h-fit">
              {CATALOG_KEYS.map((key) => (
                <TabsTrigger key={key} value={key}>
                  {CATALOG_META[key].title}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATALOG_KEYS.map((key) => (
              <TabsContent key={key} value={key}>
                <CatalogManager catalogKey={key} />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="status" className="flex flex-col gap-4 pt-4">
          <StatusConfigManager
            title="Status de Orçamentos"
            description="Rótulos e disponibilidade dos status do Pipeline de Orçamentos."
            configs={quoteStatusConfigs}
            onUpdate={updateQuoteStatusConfig}
          />
          <StatusConfigManager
            title="Status de Ordens de Serviço"
            description="Rótulos e disponibilidade dos status do Pipeline de Ordens de Serviço."
            configs={serviceOrderStatusConfigs}
            onUpdate={updateServiceOrderStatusConfig}
          />
        </TabsContent>

        <TabsContent value="pagamentos" className="pt-4">
          <PaymentMethodsManager />
        </TabsContent>

        <TabsContent value="bancos" className="pt-4">
          <BanksManager />
        </TabsContent>

        <TabsContent value="tecnicos" className="pt-4">
          <TechniciansManager />
        </TabsContent>

        <TabsContent value="checklists" className="flex flex-col gap-4 pt-4">
          <ChecklistTemplatesManager kind="inspection" />
          <ChecklistTemplatesManager kind="service_order" />
        </TabsContent>

        <TabsContent value="empresa" className="pt-4">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="ajuda" className="pt-4">
          <HelpCenter />
        </TabsContent>

        <TabsContent value="logs" className="pt-4">
          <TechnicalLogsView />
        </TabsContent>

        <TabsContent value="sobre" className="pt-4">
          <AboutSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}
