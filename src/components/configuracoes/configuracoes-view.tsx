"use client";

import { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const SETTINGS_TABS = [
  { value: "catalogos", label: "Catálogos" },
  { value: "status", label: "Status" },
  { value: "pagamentos", label: "Formas de Pagamento" },
  { value: "bancos", label: "Bancos" },
  { value: "tecnicos", label: "Técnicos" },
  { value: "checklists", label: "Templates de Checklist" },
  { value: "empresa", label: "Empresa" },
  { value: "ajuda", label: "Ajuda" },
  { value: "logs", label: "Logs Técnicos" },
  { value: "sobre", label: "Sobre o Sistema" },
] as const;

export function ConfiguracoesView() {
  const quoteStatusConfigs = useErpDataStore((state) => state.quoteStatusConfigs);
  const serviceOrderStatusConfigs = useErpDataStore((state) => state.serviceOrderStatusConfigs);
  const updateQuoteStatusConfig = useErpDataStore((state) => state.updateQuoteStatusConfig);
  const updateServiceOrderStatusConfig = useErpDataStore(
    (state) => state.updateServiceOrderStatusConfig,
  );

  const [activeTab, setActiveTab] = useState<string>(SETTINGS_TABS[0].value);
  const [activeCatalog, setActiveCatalog] = useState<CatalogKey>(CATALOG_KEYS[0]);

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

      <Tabs value={activeTab} onValueChange={(value) => value && setActiveTab(value as string)}>
        <div className="sm:hidden">
          <Select
            value={activeTab}
            onValueChange={(value) => value && setActiveTab(value as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SETTINGS_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden flex-wrap sm:flex">
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="catalogos" className="flex flex-col gap-3 pt-4">
          <div className="sm:hidden">
            <Select
              value={activeCatalog}
              onValueChange={(value) => value && setActiveCatalog(value as CatalogKey)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATALOG_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {CATALOG_META[key].title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs
            value={activeCatalog}
            onValueChange={(value) => value && setActiveCatalog(value as CatalogKey)}
            orientation="vertical"
          >
            <TabsList variant="line" className="hidden h-fit sm:flex">
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
