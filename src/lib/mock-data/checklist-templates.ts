import type { ChecklistItem } from "@/lib/mock-data/service-orders-data";

/**
 * Templates de checklist (Fase 2B.5 — Configurações > Templates de Checklist).
 * Substituem os checklists fixos de Vistoria e Ordem de Serviço que existiam
 * diretamente no código. Estrutura: Template > Etapa > Item.
 */

export type ChecklistTemplateKind = "inspection" | "service_order";

export const CHECKLIST_TEMPLATE_KIND_LABELS: Record<ChecklistTemplateKind, string> = {
  inspection: "Checklist de Vistoria",
  service_order: "Checklist de Ordem de Serviço",
};

export type ChecklistTemplateItem = {
  id: string;
  label: string;
};

export type ChecklistTemplateStage = {
  id: string;
  name: string;
  items: ChecklistTemplateItem[];
};

export type ChecklistTemplate = {
  id: string;
  kind: ChecklistTemplateKind;
  name: string;
  active: boolean;
  stages: ChecklistTemplateStage[];
};

export const DEFAULT_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "chk-tpl-inspection-default",
    kind: "inspection",
    name: "Checklist padrão de vistoria",
    active: true,
    stages: [
      {
        id: "stage-lataria",
        name: "Lataria",
        items: [{ id: "item-1", label: "Lataria sem avarias visíveis" }],
      },
      {
        id: "stage-pintura",
        name: "Pintura",
        items: [{ id: "item-2", label: "Pintura sem riscos ou descascamentos" }],
      },
      {
        id: "stage-pneus",
        name: "Pneus",
        items: [
          { id: "item-3", label: "Pneus com desgaste dentro do limite" },
          { id: "item-4", label: "Estepe presente e calibrado" },
        ],
      },
      {
        id: "stage-interior",
        name: "Interior",
        items: [
          { id: "item-5", label: "Estofados e bancos sem manchas/rasgos" },
          { id: "item-6", label: "Painel e comandos funcionando" },
        ],
      },
      {
        id: "stage-eletrica",
        name: "Elétrica",
        items: [
          { id: "item-7", label: "Faróis e lanternas funcionando" },
          { id: "item-8", label: "Bateria sem sinais de oxidação" },
        ],
      },
    ],
  },
  {
    id: "chk-tpl-service-order-default",
    kind: "service_order",
    name: "Checklist padrão de ordem de serviço",
    active: true,
    stages: [
      {
        id: "stage-recepcao",
        name: "Recepção",
        items: [
          { id: "item-1", label: "Conferir avarias registradas na vistoria" },
          { id: "item-2", label: "Separar peças e materiais necessários" },
        ],
      },
      {
        id: "stage-entrega",
        name: "Entrega",
        items: [{ id: "item-3", label: "Inspeção final e limpeza" }],
      },
    ],
  },
];

/** Converte um template em uma lista de itens de checklist (Etapa > Item flatten). */
export function buildChecklistFromTemplate(
  template: ChecklistTemplate,
  idPrefix: string,
): ChecklistItem[] {
  return template.stages.flatMap((stage, stageIndex) =>
    stage.items.map((item, itemIndex) => ({
      id: `${idPrefix}-${stageIndex}-${itemIndex}`,
      label: item.label,
      done: false,
      category: stage.name,
    })),
  );
}
