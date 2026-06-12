import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  INSPECTIONS,
  type DamagePoint,
  type Inspection,
  type InspectionStatus,
} from "@/lib/mock-data/inspections";
import { REFERENCE_DATE } from "@/lib/mock-data/reference-date";
import {
  QUOTE_CATEGORY_LABELS,
  QUOTES,
  type Quote,
  type QuoteItem,
  type QuoteStatus,
} from "@/lib/mock-data/quotes-data";
import {
  SERVICE_ORDERS,
  type ChecklistItem,
  type ServiceOrder,
  type ServiceOrderStatus,
} from "@/lib/mock-data/service-orders-data";
import { CURRENT_USER_NAME, type StatusChangeEvent } from "@/lib/mock-data/status-history";
import type { Attachment } from "@/lib/mock-data/attachments";
import { VEHICLES, type JourneyStage, type Vehicle } from "@/lib/mock-data/vehicles";

type ErpDataState = {
  quotes: Quote[];
  serviceOrders: ServiceOrder[];
  vehicles: Vehicle[];
  inspections: Inspection[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  changeQuoteStatus: (id: string, status: QuoteStatus, reason?: string) => void;
  changeServiceOrderStatus: (id: string, status: ServiceOrderStatus, reason?: string) => void;
  setServiceOrderTechnician: (id: string, technicianId: string) => void;
  setVehicleJourneyStage: (vehicleId: string, stage: JourneyStage) => void;
  createQuote: (input: {
    clientId: string;
    vehicleId: string;
    items: QuoteItem[];
    notes?: string;
  }) => Quote;
  createServiceOrderFromQuote: (quoteId: string) => ServiceOrder | undefined;
  createInspection: (input: {
    clientId: string;
    vehicleId: string;
    mileage: number;
    fuelLevel: number;
    checklist: ChecklistItem[];
    damagePoints: DamagePoint[];
    photos: Attachment[];
    notes?: string;
  }) => Inspection;
  changeInspectionStatus: (id: string, status: InspectionStatus) => void;
};

/** Etapa do Pátio correspondente a cada status de Ordem de Serviço (MELHORIA: sincronização da Jornada do Veículo). */
const SERVICE_ORDER_STATUS_TO_JOURNEY_STAGE: Partial<Record<ServiceOrderStatus, JourneyStage>> = {
  aguardando_inicio: "aguardando_inicio",
  em_execucao: "em_execucao",
  aguardando_peca: "aguardando_peca",
  finalizado: "pronto_para_retirada",
  entregue: "entregue",
};

function updateVehicleJourneyStage(
  vehicles: Vehicle[],
  vehicleId: string,
  stage: JourneyStage,
): Vehicle[] {
  return vehicles.map((vehicle) =>
    vehicle.id === vehicleId
      ? { ...vehicle, journeyStage: stage, journeyStageUpdatedAt: new Date().toISOString() }
      : vehicle,
  );
}

function buildStatusChangeEvent(from: string, to: string, reason?: string): StatusChangeEvent {
  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    user: CURRENT_USER_NAME,
    from,
    to,
    reason,
  };
}

function nextSequentialCode(existingCodes: string[], prefix: string): string {
  const max = existingCodes.reduce((highest, code) => {
    const match = code.match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return value > highest ? value : highest;
  }, 0);
  return `${prefix}${String(max + 1).padStart(6, "0")}`;
}

function addDaysToReferenceDate(days: number): string {
  const date = new Date(`${REFERENCE_DATE}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Store compartilhada das entidades operacionais (Orçamentos e Ordens de Serviço).
 * Mantém em memória/localStorage as mudanças de status feitas pelas telas de detalhe,
 * permitindo que Dashboard, Pipeline (Kanban) e Lista permaneçam sincronizados nesta
 * fase mockada (sem backend real).
 */
export const useErpDataStore = create<ErpDataState>()(
  persist(
    (set, get) => ({
      quotes: QUOTES,
      serviceOrders: SERVICE_ORDERS,
      vehicles: VEHICLES,
      inspections: INSPECTIONS,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      changeQuoteStatus: (id, status, reason) =>
        set((state) => {
          const quote = state.quotes.find((item) => item.id === id);
          if (!quote || quote.status === status) return {};

          const vehicles =
            status === "aprovado"
              ? updateVehicleJourneyStage(state.vehicles, quote.vehicleId, "aguardando_inicio")
              : state.vehicles;

          return {
            vehicles,
            quotes: state.quotes.map((item) => {
              if (item.id !== id) return item;
              return {
                ...item,
                status,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                  ...(item.statusHistory ?? []),
                  buildStatusChangeEvent(item.status, status, reason),
                ],
              };
            }),
          };
        }),
      changeServiceOrderStatus: (id, status, reason) =>
        set((state) => {
          const order = state.serviceOrders.find((item) => item.id === id);
          if (!order || order.status === status) return {};

          const journeyStage = SERVICE_ORDER_STATUS_TO_JOURNEY_STAGE[status];
          const vehicles = journeyStage
            ? updateVehicleJourneyStage(state.vehicles, order.vehicleId, journeyStage)
            : state.vehicles;

          return {
            vehicles,
            serviceOrders: state.serviceOrders.map((item) => {
              if (item.id !== id) return item;
              return {
                ...item,
                status,
                updatedAt: new Date().toISOString(),
                statusHistory: [
                  ...(item.statusHistory ?? []),
                  buildStatusChangeEvent(item.status, status, reason),
                ],
              };
            }),
          };
        }),
      setServiceOrderTechnician: (id, technicianId) =>
        set((state) => ({
          serviceOrders: state.serviceOrders.map((order) =>
            order.id === id ? { ...order, technicianId } : order,
          ),
        })),
      setVehicleJourneyStage: (vehicleId, stage) =>
        set((state) => ({
          vehicles: updateVehicleJourneyStage(state.vehicles, vehicleId, stage),
        })),
      createQuote: (input) => {
        const now = new Date().toISOString();
        const newQuote: Quote = {
          id: `q-${Date.now()}`,
          code: nextSequentialCode(
            get().quotes.map((quote) => quote.code),
            "ORC-2026-",
          ),
          clientId: input.clientId,
          vehicleId: input.vehicleId,
          status: "rascunho",
          items: input.items,
          notes: input.notes,
          attachments: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ quotes: [newQuote, ...state.quotes] }));
        return newQuote;
      },
      createServiceOrderFromQuote: (quoteId) => {
        const state = get();
        const quote = state.quotes.find((item) => item.id === quoteId);
        if (!quote) return undefined;

        if (quote.convertedServiceOrderId) {
          const existing = state.serviceOrders.find(
            (order) => order.id === quote.convertedServiceOrderId,
          );
          if (existing) return existing;
        }

        const now = new Date().toISOString();
        const newOrderId = `os-${Date.now()}`;

        const checklist: ChecklistItem[] = [
          {
            id: `${newOrderId}-c0`,
            label: "Conferir avarias registradas na vistoria",
            done: false,
            category: "Recepção",
          },
          ...quote.items.map((item, index) => ({
            id: `${newOrderId}-c${index + 1}`,
            label: item.description,
            done: false,
            category: QUOTE_CATEGORY_LABELS[item.category],
          })),
          {
            id: `${newOrderId}-c-final`,
            label: "Inspeção final e limpeza",
            done: false,
            category: "Entrega",
          },
        ];

        const newOrder: ServiceOrder = {
          id: newOrderId,
          code: nextSequentialCode(
            state.serviceOrders.map((order) => order.code),
            "OS-2026-",
          ),
          clientId: quote.clientId,
          vehicleId: quote.vehicleId,
          status: "aguardando_inicio",
          technicianId: "tec-003",
          quoteId: quote.id,
          items: quote.items.map((item) => ({
            id: `${newOrderId}-${item.id}`,
            description: item.description,
            category: QUOTE_CATEGORY_LABELS[item.category],
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          checklist,
          timeLogs: [],
          photos: [],
          notes: `Convertida automaticamente do orçamento ${quote.code} (aprovado).`,
          dueDate: addDaysToReferenceDate(3),
          createdAt: now,
          updatedAt: now,
        };

        set((current) => ({
          serviceOrders: [newOrder, ...current.serviceOrders],
          quotes: current.quotes.map((item) =>
            item.id === quoteId ? { ...item, convertedServiceOrderId: newOrder.id } : item,
          ),
        }));

        return newOrder;
      },
      createInspection: (input) => {
        const now = new Date().toISOString();
        const newInspection: Inspection = {
          id: `vis-${Date.now()}`,
          code: nextSequentialCode(
            get().inspections.map((inspection) => inspection.code),
            "VIS-",
          ),
          clientId: input.clientId,
          vehicleId: input.vehicleId,
          status: "pendente",
          mileage: input.mileage,
          fuelLevel: input.fuelLevel,
          checklist: input.checklist,
          damagePoints: input.damagePoints,
          photos: input.photos,
          notes: input.notes,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          inspections: [newInspection, ...state.inspections],
          vehicles: updateVehicleJourneyStage(state.vehicles, input.vehicleId, "em_vistoria"),
        }));

        return newInspection;
      },
      changeInspectionStatus: (id, status) =>
        set((state) => {
          const inspection = state.inspections.find((item) => item.id === id);
          if (!inspection || inspection.status === status) return {};

          const vehicles =
            status === "concluida"
              ? updateVehicleJourneyStage(
                  state.vehicles,
                  inspection.vehicleId,
                  "aguardando_aprovacao",
                )
              : state.vehicles;

          return {
            vehicles,
            inspections: state.inspections.map((item) =>
              item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
            ),
          };
        }),
    }),
    {
      name: "erp-data-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
