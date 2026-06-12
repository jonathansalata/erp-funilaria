import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  APPOINTMENTS,
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
} from "@/lib/mock-data/appointments";
import {
  CLIENTS,
  CLIENT_STATUS_META,
  type Client,
  type ClientStatus,
  type ClientType,
} from "@/lib/mock-data/clients";
import { canDeleteClient, canDeleteVehicle } from "@/lib/mock-data/crm";
import { ENTITY_EVENTS, type EntityEvent, type EntityType } from "@/lib/mock-data/entity-events";
import {
  PAYABLES,
  PAYMENT_METHOD_LABELS,
  RECEIVABLES,
  sumPayments,
  type Payable,
  type PayableCategory,
  type PayableStatus,
  type PaymentEntry,
  type PaymentEntryInput,
  type Receivable,
  type ReceivableStatus,
} from "@/lib/mock-data/financeiro";
import {
  INSPECTIONS,
  INSPECTION_STATUS_META,
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
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import {
  SERVICE_ORDERS,
  type ChecklistItem,
  type ServiceOrder,
  type ServiceOrderStatus,
} from "@/lib/mock-data/service-orders-data";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import { CURRENT_USER_NAME, type StatusChangeEvent } from "@/lib/mock-data/status-history";
import { formatCurrency } from "@/lib/utils";
import type { Attachment } from "@/lib/mock-data/attachments";
import {
  VEHICLES,
  VEHICLE_STATUS_META,
  type FuelType,
  type JourneyStage,
  type Vehicle,
  type VehicleStatus,
} from "@/lib/mock-data/vehicles";

/** Dados de um novo veículo cadastrado junto com o cliente ou adicionado posteriormente. */
export type NewVehicleInput = {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassi?: string;
  renavam?: string;
  fuel?: FuelType;
  mileage: number;
  notes?: string;
};

/** Campos editáveis do cadastro de cliente (Pessoa Física ou Pessoa Jurídica). */
export type ClientFormFields = {
  name: string;
  type: ClientType;
  document: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  rg?: string;
  birthDate?: string;
  fantasyName?: string;
  stateRegistration?: string;
  responsibleName?: string;
  notes?: string;
};

type ErpDataState = {
  clients: Client[];
  quotes: Quote[];
  serviceOrders: ServiceOrder[];
  vehicles: Vehicle[];
  inspections: Inspection[];
  appointments: Appointment[];
  receivables: Receivable[];
  payables: Payable[];
  events: EntityEvent[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  createClient: (input: ClientFormFields & { vehicles?: NewVehicleInput[] }) => Client;
  updateClient: (id: string, input: Partial<ClientFormFields>) => void;
  changeClientStatus: (id: string, status: ClientStatus, reason?: string) => void;
  deleteClient: (id: string) => void;
  addVehicleToClient: (clientId: string, input: NewVehicleInput) => Vehicle;
  updateVehicleDetails: (id: string, input: Partial<NewVehicleInput>) => void;
  changeVehicleStatus: (id: string, status: VehicleStatus, reason?: string) => void;
  deleteVehicle: (id: string) => void;
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
  createAppointment: (input: {
    title: string;
    type: AppointmentType;
    date: string;
    time: string;
    clientId?: string;
    vehicleId?: string;
    inspectionId?: string;
    quoteId?: string;
    serviceOrderId?: string;
    notes?: string;
  }) => Appointment;
  updateAppointment: (
    id: string,
    input: Partial<
      Pick<
        Appointment,
        | "title"
        | "type"
        | "date"
        | "time"
        | "clientId"
        | "vehicleId"
        | "inspectionId"
        | "quoteId"
        | "serviceOrderId"
        | "notes"
      >
    >,
  ) => void;
  changeAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  createReceivable: (input: {
    clientId: string;
    document: string;
    description?: string;
    value: number;
    dueDate: string;
  }) => Receivable;
  updateReceivable: (
    id: string,
    input: Partial<Pick<Receivable, "clientId" | "document" | "description" | "value" | "dueDate">>,
  ) => void;
  receiveReceivable: (id: string, payments: PaymentEntryInput[]) => void;
  updateReceivablePayment: (
    receivableId: string,
    paymentId: string,
    input: Partial<Pick<PaymentEntry, "method" | "cardBrand" | "installments" | "notes">>,
  ) => void;
  reverseReceivable: (id: string) => void;
  cancelReceivable: (id: string) => void;
  deleteReceivable: (id: string) => void;
  createPayable: (input: {
    supplier: string;
    category: PayableCategory;
    description?: string;
    value: number;
    dueDate: string;
  }) => Payable;
  updatePayable: (
    id: string,
    input: Partial<Pick<Payable, "supplier" | "category" | "description" | "value" | "dueDate">>,
  ) => void;
  payPayable: (id: string, payments: PaymentEntryInput[]) => void;
  reversePayable: (id: string) => void;
  cancelPayable: (id: string) => void;
  deletePayable: (id: string) => void;
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

function buildEntityEvent(params: {
  entityType: EntityType;
  entityId: string;
  eventType: EntityEvent["eventType"];
  title: string;
  description?: string;
  metadata?: EntityEvent["metadata"];
}): EntityEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    title: params.title,
    description: params.description,
    metadata: params.metadata,
    createdBy: CURRENT_USER_NAME,
    createdAt: new Date().toISOString(),
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

const CLIENT_FIELD_LABELS: Record<string, string> = {
  name: "Nome/Razão social",
  type: "Tipo",
  document: "CPF/CNPJ",
  phone: "Telefone",
  whatsapp: "WhatsApp",
  email: "E-mail",
  address: "Endereço",
  zipCode: "CEP",
  street: "Logradouro",
  number: "Número",
  complement: "Complemento",
  neighborhood: "Bairro",
  city: "Cidade",
  state: "Estado",
  rg: "RG",
  birthDate: "Data de nascimento",
  fantasyName: "Nome fantasia",
  stateRegistration: "Inscrição estadual",
  responsibleName: "Responsável",
  notes: "Observações",
};

const VEHICLE_FIELD_LABELS: Record<string, string> = {
  plate: "Placa",
  brand: "Marca",
  model: "Modelo",
  year: "Ano",
  color: "Cor",
  chassi: "Chassi",
  renavam: "Renavam",
  fuel: "Combustível",
  mileage: "KM atual",
  notes: "Observações",
};

/** Monta a descrição "Campo: valor anterior → valor novo" para os eventos de auditoria. */
function buildChangeDescription<T extends Record<string, unknown>>(
  before: T,
  changes: Partial<T>,
  labels: Record<string, string>,
): string | undefined {
  const lines = Object.entries(changes)
    .filter(([key, value]) => value !== undefined && before[key] !== value)
    .map(([key, value]) => {
      const label = labels[key] ?? key;
      const previous = before[key];
      return `${label}: "${previous ?? "-"}" → "${value ?? "-"}"`;
    });

  return lines.length > 0 ? lines.join("; ") : undefined;
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
      clients: CLIENTS,
      quotes: QUOTES,
      serviceOrders: SERVICE_ORDERS,
      vehicles: VEHICLES,
      inspections: INSPECTIONS,
      appointments: APPOINTMENTS,
      receivables: RECEIVABLES,
      payables: PAYABLES,
      events: ENTITY_EVENTS,
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

          const event = buildEntityEvent({
            entityType: "quote",
            entityId: id,
            eventType: "status_changed",
            title: `Status alterado para ${QUOTE_STATUS_META[status].title}`,
            description: reason,
            metadata: {
              vehicleId: quote.vehicleId,
              clientId: quote.clientId,
              fromStatus: quote.status,
              toStatus: status,
            },
          });

          return {
            vehicles,
            events: [...state.events, event],
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

          const event = buildEntityEvent({
            entityType: "service_order",
            entityId: id,
            eventType: "status_changed",
            title: `Status alterado para ${SERVICE_ORDER_STATUS_META[status].title}`,
            description: reason,
            metadata: {
              vehicleId: order.vehicleId,
              clientId: order.clientId,
              fromStatus: order.status,
              toStatus: status,
            },
          });

          return {
            vehicles,
            events: [...state.events, event],
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
        const event = buildEntityEvent({
          entityType: "quote",
          entityId: newQuote.id,
          eventType: "created",
          title: "Orçamento criado",
          description: `Orçamento ${newQuote.code} criado a partir do atendimento de recepção.`,
          metadata: { vehicleId: newQuote.vehicleId, clientId: newQuote.clientId },
        });
        set((state) => ({ quotes: [newQuote, ...state.quotes], events: [...state.events, event] }));
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

        const createdEvent = buildEntityEvent({
          entityType: "service_order",
          entityId: newOrder.id,
          eventType: "created",
          title: "Ordem de serviço criada",
          description: `${newOrder.code} criada a partir do orçamento ${quote.code}.`,
          metadata: { vehicleId: newOrder.vehicleId, clientId: newOrder.clientId },
        });
        const convertedEvent = buildEntityEvent({
          entityType: "quote",
          entityId: quote.id,
          eventType: "converted_to_os",
          title: "Convertido em Ordem de Serviço",
          description: `${newOrder.code} criada a partir deste orçamento.`,
          metadata: {
            vehicleId: quote.vehicleId,
            clientId: quote.clientId,
            serviceOrderId: newOrder.id,
          },
        });

        set((current) => ({
          serviceOrders: [newOrder, ...current.serviceOrders],
          events: [...current.events, createdEvent, convertedEvent],
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

        const createdEvent = buildEntityEvent({
          entityType: "inspection",
          entityId: newInspection.id,
          eventType: "created",
          title: "Vistoria criada",
          description: `${newInspection.code} aberta na recepção.`,
          metadata: { vehicleId: input.vehicleId, clientId: input.clientId },
        });

        set((state) => ({
          inspections: [newInspection, ...state.inspections],
          vehicles: updateVehicleJourneyStage(state.vehicles, input.vehicleId, "em_vistoria"),
          events: [...state.events, createdEvent],
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

          const event = buildEntityEvent({
            entityType: "inspection",
            entityId: id,
            eventType: "status_changed",
            title: `Status alterado para ${INSPECTION_STATUS_META[status].title}`,
            metadata: {
              vehicleId: inspection.vehicleId,
              clientId: inspection.clientId,
              fromStatus: inspection.status,
              toStatus: status,
            },
          });

          return {
            vehicles,
            events: [...state.events, event],
            inspections: state.inspections.map((item) =>
              item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
            ),
          };
        }),
      createAppointment: (input) => {
        const now = new Date().toISOString();
        const newAppointment: Appointment = {
          id: `apt-${Date.now()}`,
          code: nextSequentialCode(
            get().appointments.map((item) => item.code),
            "AGD-",
          ),
          title: input.title,
          type: input.type,
          status: "agendado",
          date: input.date,
          time: input.time,
          clientId: input.clientId,
          vehicleId: input.vehicleId,
          inspectionId: input.inspectionId,
          quoteId: input.quoteId,
          serviceOrderId: input.serviceOrderId,
          notes: input.notes,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ appointments: [newAppointment, ...state.appointments] }));
        return newAppointment;
      },
      updateAppointment: (id, input) =>
        set((state) => ({
          appointments: state.appointments.map((item) =>
            item.id === id ? { ...item, ...input, updatedAt: new Date().toISOString() } : item,
          ),
        })),
      changeAppointmentStatus: (id, status) =>
        set((state) => ({
          appointments: state.appointments.map((item) =>
            item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
          ),
        })),
      deleteAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((item) => item.id !== id),
        })),
      createReceivable: (input) => {
        const now = new Date().toISOString();
        const newReceivable: Receivable = {
          id: `rec-${Date.now()}`,
          code: nextSequentialCode(
            get().receivables.map((item) => item.code),
            "REC-",
          ),
          clientId: input.clientId,
          document: input.document,
          description: input.description,
          value: input.value,
          dueDate: input.dueDate,
          status: "aberto",
          createdAt: now,
          updatedAt: now,
        };
        const event = buildEntityEvent({
          entityType: "receivable",
          entityId: newReceivable.id,
          eventType: "created",
          title: "Conta a receber criada",
          description: `${newReceivable.code} — ${formatCurrency(newReceivable.value)}`,
          metadata: { clientId: input.clientId, receivableId: newReceivable.id },
        });
        set((state) => ({
          receivables: [newReceivable, ...state.receivables],
          events: [...state.events, event],
        }));
        return newReceivable;
      },
      updateReceivable: (id, input) =>
        set((state) => {
          const item = state.receivables.find((entry) => entry.id === id);
          if (!item) return {};
          const now = new Date().toISOString();
          const event = buildEntityEvent({
            entityType: "receivable",
            entityId: id,
            eventType: "updated",
            title: "Conta a receber atualizada",
            metadata: {
              previousValue: item.value,
              newValue: input.value ?? item.value,
              receivableId: id,
              clientId: item.clientId,
            },
          });
          return {
            receivables: state.receivables.map((entry) =>
              entry.id === id ? { ...entry, ...input, updatedAt: now } : entry,
            ),
            events: [...state.events, event],
          };
        }),
      receiveReceivable: (id, payments) =>
        set((state) => {
          const item = state.receivables.find((entry) => entry.id === id);
          if (!item || payments.length === 0) return {};

          const now = new Date().toISOString();
          const newPayments: PaymentEntry[] = payments.map((payment, index) => ({
            id: `pay-${id}-${Date.now()}-${index}`,
            method: payment.method,
            value: payment.value,
            paidAt: payment.paidAt ?? now,
            cardBrand: payment.cardBrand,
            installments: payment.installments,
            notes: payment.notes,
            stage: payment.stage,
            createdBy: CURRENT_USER_NAME,
          }));

          const amount = sumPayments(newPayments);
          const previousReceived = item.receivedValue ?? 0;
          const receivedValue = previousReceived + amount;
          const status: ReceivableStatus = receivedValue >= item.value ? "recebido" : "parcial";

          const event = buildEntityEvent({
            entityType: "receivable",
            entityId: id,
            eventType: status === "recebido" ? "payment_received" : "payment_partial",
            title:
              status === "recebido"
                ? "Recebimento total registrado"
                : "Recebimento parcial registrado",
            description: newPayments
              .map(
                (payment) =>
                  `${PAYMENT_METHOD_LABELS[payment.method]}: ${formatCurrency(payment.value)}`,
              )
              .join(", "),
            metadata: {
              previousValue: previousReceived,
              newValue: receivedValue,
              receivableId: id,
              clientId: item.clientId,
            },
          });

          return {
            receivables: state.receivables.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    status,
                    receivedValue,
                    receivedAt: now,
                    payments: [...(entry.payments ?? []), ...newPayments],
                    updatedAt: now,
                  }
                : entry,
            ),
            events: [...state.events, event],
          };
        }),
      updateReceivablePayment: (receivableId, paymentId, input) =>
        set((state) => {
          const item = state.receivables.find((entry) => entry.id === receivableId);
          const payment = item?.payments?.find((entry) => entry.id === paymentId);
          if (!item || !payment) return {};

          const now = new Date().toISOString();
          const auditEvents: EntityEvent[] = [];

          if (input.method && input.method !== payment.method) {
            auditEvents.push(
              buildEntityEvent({
                entityType: "receivable",
                entityId: receivableId,
                eventType: "payment_method_changed",
                title: "Forma de pagamento alterada",
                description: `${PAYMENT_METHOD_LABELS[payment.method]} → ${PAYMENT_METHOD_LABELS[input.method]}`,
                metadata: {
                  previousValue: payment.method,
                  newValue: input.method,
                  receivableId,
                  clientId: item.clientId,
                },
              }),
            );
          }

          if (input.installments !== undefined && input.installments !== payment.installments) {
            auditEvents.push(
              buildEntityEvent({
                entityType: "receivable",
                entityId: receivableId,
                eventType: "installment_changed",
                title: "Parcelamento alterado",
                description: `${payment.installments ?? 1}x → ${input.installments}x`,
                metadata: {
                  previousValue: payment.installments ?? 1,
                  newValue: input.installments,
                  receivableId,
                  clientId: item.clientId,
                },
              }),
            );
          }

          return {
            receivables: state.receivables.map((entry) =>
              entry.id === receivableId
                ? {
                    ...entry,
                    payments: entry.payments?.map((paymentEntry) =>
                      paymentEntry.id === paymentId ? { ...paymentEntry, ...input } : paymentEntry,
                    ),
                    updatedAt: now,
                  }
                : entry,
            ),
            events: [...state.events, ...auditEvents],
          };
        }),
      reverseReceivable: (id) =>
        set((state) => {
          const item = state.receivables.find((entry) => entry.id === id);
          if (!item) return {};
          const now = new Date().toISOString();
          const event = buildEntityEvent({
            entityType: "receivable",
            entityId: id,
            eventType: "payment_reversed",
            title: "Recebimento estornado",
            description: `Valor revertido: ${formatCurrency(item.receivedValue ?? 0)}`,
            metadata: {
              previousValue: item.receivedValue ?? 0,
              newValue: 0,
              receivableId: id,
              clientId: item.clientId,
            },
          });
          return {
            receivables: state.receivables.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    status: "aberto",
                    receivedValue: undefined,
                    receivedAt: undefined,
                    payments: undefined,
                    updatedAt: now,
                  }
                : entry,
            ),
            events: [...state.events, event],
          };
        }),
      cancelReceivable: (id) =>
        set((state) => {
          const item = state.receivables.find((entry) => entry.id === id);
          if (!item) return {};
          const now = new Date().toISOString();
          const event = buildEntityEvent({
            entityType: "receivable",
            entityId: id,
            eventType: "payment_cancelled",
            title: "Conta a receber cancelada",
            metadata: {
              previousValue: item.status,
              newValue: "cancelado",
              receivableId: id,
              clientId: item.clientId,
            },
          });
          return {
            receivables: state.receivables.map((entry) =>
              entry.id === id ? { ...entry, status: "cancelado", updatedAt: now } : entry,
            ),
            events: [...state.events, event],
          };
        }),
      deleteReceivable: (id) =>
        set((state) => ({
          receivables: state.receivables.filter((item) => item.id !== id),
        })),
      createPayable: (input) => {
        const now = new Date().toISOString();
        const newPayable: Payable = {
          id: `pay-${Date.now()}`,
          code: nextSequentialCode(
            get().payables.map((item) => item.code),
            "PAG-",
          ),
          supplier: input.supplier,
          category: input.category,
          description: input.description,
          value: input.value,
          dueDate: input.dueDate,
          status: "aberto",
          createdAt: now,
          updatedAt: now,
        };
        const event = buildEntityEvent({
          entityType: "payable",
          entityId: newPayable.id,
          eventType: "created",
          title: "Conta a pagar criada",
          description: `${newPayable.code} — ${formatCurrency(newPayable.value)}`,
          metadata: { payableId: newPayable.id },
        });
        set((state) => ({
          payables: [newPayable, ...state.payables],
          events: [...state.events, event],
        }));
        return newPayable;
      },
      updatePayable: (id, input) =>
        set((state) => {
          const item = state.payables.find((entry) => entry.id === id);
          if (!item) return {};
          const now = new Date().toISOString();
          const event = buildEntityEvent({
            entityType: "payable",
            entityId: id,
            eventType: "updated",
            title: "Conta a pagar atualizada",
            metadata: {
              previousValue: item.value,
              newValue: input.value ?? item.value,
              payableId: id,
            },
          });
          return {
            payables: state.payables.map((entry) =>
              entry.id === id ? { ...entry, ...input, updatedAt: now } : entry,
            ),
            events: [...state.events, event],
          };
        }),
      payPayable: (id, payments) =>
        set((state) => {
          const item = state.payables.find((entry) => entry.id === id);
          if (!item || payments.length === 0) return {};

          const now = new Date().toISOString();
          const newPayments: PaymentEntry[] = payments.map((payment, index) => ({
            id: `pay-${id}-${Date.now()}-${index}`,
            method: payment.method,
            value: payment.value,
            paidAt: payment.paidAt ?? now,
            cardBrand: payment.cardBrand,
            installments: payment.installments,
            notes: payment.notes,
            createdBy: CURRENT_USER_NAME,
          }));

          const event = buildEntityEvent({
            entityType: "payable",
            entityId: id,
            eventType: "payment_received",
            title: "Pagamento registrado",
            description: newPayments
              .map(
                (payment) =>
                  `${PAYMENT_METHOD_LABELS[payment.method]}: ${formatCurrency(payment.value)}`,
              )
              .join(", "),
            metadata: { previousValue: item.status, newValue: "pago", payableId: id },
          });

          return {
            payables: state.payables.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    status: "pago" as PayableStatus,
                    paidAt: now,
                    payments: [...(entry.payments ?? []), ...newPayments],
                    updatedAt: now,
                  }
                : entry,
            ),
            events: [...state.events, event],
          };
        }),
      reversePayable: (id) =>
        set((state) => {
          const item = state.payables.find((entry) => entry.id === id);
          if (!item) return {};
          const now = new Date().toISOString();
          const event = buildEntityEvent({
            entityType: "payable",
            entityId: id,
            eventType: "payment_reversed",
            title: "Pagamento estornado",
            metadata: { previousValue: "pago", newValue: "aberto", payableId: id },
          });
          return {
            payables: state.payables.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    status: "aberto" as PayableStatus,
                    paidAt: undefined,
                    payments: undefined,
                    updatedAt: now,
                  }
                : entry,
            ),
            events: [...state.events, event],
          };
        }),
      cancelPayable: (id) =>
        set((state) => {
          const item = state.payables.find((entry) => entry.id === id);
          if (!item) return {};
          const now = new Date().toISOString();
          const event = buildEntityEvent({
            entityType: "payable",
            entityId: id,
            eventType: "payment_cancelled",
            title: "Conta a pagar cancelada",
            metadata: { previousValue: item.status, newValue: "cancelado", payableId: id },
          });
          return {
            payables: state.payables.map((entry) =>
              entry.id === id
                ? { ...entry, status: "cancelado" as PayableStatus, updatedAt: now }
                : entry,
            ),
            events: [...state.events, event],
          };
        }),
      deletePayable: (id) =>
        set((state) => ({
          payables: state.payables.filter((item) => item.id !== id),
        })),
      createClient: (input) => {
        const now = new Date().toISOString();
        const newClientId = `cli-${Date.now()}`;
        const { vehicles: vehicleInputs, ...clientFields } = input;

        const vehicleCodes = get().vehicles.map((vehicle) => vehicle.code);
        const newVehicles: Vehicle[] = (vehicleInputs ?? []).map((vehicleInput, index) => {
          const code = nextSequentialCode(vehicleCodes, "VEI-");
          vehicleCodes.push(code);
          return {
            id: `vei-${Date.now()}-${index}`,
            code,
            clientId: newClientId,
            plate: vehicleInput.plate,
            brand: vehicleInput.brand,
            model: vehicleInput.model,
            year: vehicleInput.year,
            color: vehicleInput.color,
            chassi: vehicleInput.chassi,
            renavam: vehicleInput.renavam,
            fuel: vehicleInput.fuel,
            mileage: vehicleInput.mileage,
            status: "ativo",
            journeyStage: null,
            notes: vehicleInput.notes,
          };
        });

        const newClient: Client = {
          ...clientFields,
          id: newClientId,
          code: nextSequentialCode(
            get().clients.map((client) => client.code),
            "CLI-",
          ),
          status: "ativo",
          vehicleIds: newVehicles.map((vehicle) => vehicle.id),
          createdAt: now,
        };

        const clientEvent = buildEntityEvent({
          entityType: "client",
          entityId: newClient.id,
          eventType: "created",
          title: "Cliente cadastrado",
          description: `Cliente ${newClient.code} (${newClient.name}) cadastrado.`,
          metadata: { clientId: newClient.id },
        });

        const vehicleEvents = newVehicles.map((vehicle) =>
          buildEntityEvent({
            entityType: "vehicle",
            entityId: vehicle.id,
            eventType: "created",
            title: "Veículo cadastrado",
            description: `Veículo ${vehicle.code} (${vehicle.plate}) cadastrado para o cliente ${newClient.code}.`,
            metadata: { clientId: newClient.id, vehicleId: vehicle.id },
          }),
        );

        set((state) => ({
          clients: [newClient, ...state.clients],
          vehicles: [...newVehicles, ...state.vehicles],
          events: [...state.events, clientEvent, ...vehicleEvents],
        }));

        return newClient;
      },
      updateClient: (id, input) =>
        set((state) => {
          const client = state.clients.find((item) => item.id === id);
          if (!client) return {};

          const description = buildChangeDescription(client, input, CLIENT_FIELD_LABELS);
          if (!description) return {};

          const event = buildEntityEvent({
            entityType: "client",
            entityId: id,
            eventType: "updated",
            title: "Cadastro atualizado",
            description,
            metadata: { clientId: id },
          });

          return {
            clients: state.clients.map((item) => (item.id === id ? { ...item, ...input } : item)),
            events: [...state.events, event],
          };
        }),
      changeClientStatus: (id, status, reason) =>
        set((state) => {
          const client = state.clients.find((item) => item.id === id);
          if (!client || client.status === status) return {};

          const event = buildEntityEvent({
            entityType: "client",
            entityId: id,
            eventType: status === "inativo" ? "inactivated" : "status_changed",
            title: `Status alterado para ${CLIENT_STATUS_META[status].label}`,
            description: reason,
            metadata: { clientId: id, fromStatus: client.status, toStatus: status },
          });

          return {
            clients: state.clients.map((item) => (item.id === id ? { ...item, status } : item)),
            events: [...state.events, event],
          };
        }),
      deleteClient: (id) =>
        set((state) => {
          if (!canDeleteClient(id, state.quotes, state.serviceOrders, state.receivables)) {
            return {};
          }
          const client = state.clients.find((item) => item.id === id);
          if (!client) return {};

          const event = buildEntityEvent({
            entityType: "client",
            entityId: id,
            eventType: "deleted",
            title: "Cliente excluído",
            description: `Cliente ${client.code} (${client.name}) excluído.`,
            metadata: { clientId: id },
          });

          return {
            clients: state.clients.filter((item) => item.id !== id),
            vehicles: state.vehicles.filter((vehicle) => !client.vehicleIds.includes(vehicle.id)),
            events: [...state.events, event],
          };
        }),
      addVehicleToClient: (clientId, input) => {
        const newVehicle: Vehicle = {
          id: `vei-${Date.now()}`,
          code: nextSequentialCode(
            get().vehicles.map((vehicle) => vehicle.code),
            "VEI-",
          ),
          clientId,
          plate: input.plate,
          brand: input.brand,
          model: input.model,
          year: input.year,
          color: input.color,
          chassi: input.chassi,
          renavam: input.renavam,
          fuel: input.fuel,
          mileage: input.mileage,
          status: "ativo",
          journeyStage: null,
          notes: input.notes,
        };

        const event = buildEntityEvent({
          entityType: "vehicle",
          entityId: newVehicle.id,
          eventType: "created",
          title: "Veículo cadastrado",
          description: `Veículo ${newVehicle.code} (${newVehicle.plate}) adicionado ao cliente.`,
          metadata: { clientId, vehicleId: newVehicle.id },
        });

        set((state) => ({
          vehicles: [newVehicle, ...state.vehicles],
          clients: state.clients.map((client) =>
            client.id === clientId
              ? { ...client, vehicleIds: [...client.vehicleIds, newVehicle.id] }
              : client,
          ),
          events: [...state.events, event],
        }));

        return newVehicle;
      },
      updateVehicleDetails: (id, input) =>
        set((state) => {
          const vehicle = state.vehicles.find((item) => item.id === id);
          if (!vehicle) return {};

          const description = buildChangeDescription(vehicle, input, VEHICLE_FIELD_LABELS);
          if (!description) return {};

          const event = buildEntityEvent({
            entityType: "vehicle",
            entityId: id,
            eventType: "updated",
            title: "Cadastro atualizado",
            description,
            metadata: { vehicleId: id, clientId: vehicle.clientId },
          });

          return {
            vehicles: state.vehicles.map((item) => (item.id === id ? { ...item, ...input } : item)),
            events: [...state.events, event],
          };
        }),
      changeVehicleStatus: (id, status, reason) =>
        set((state) => {
          const vehicle = state.vehicles.find((item) => item.id === id);
          if (!vehicle || vehicle.status === status) return {};

          const event = buildEntityEvent({
            entityType: "vehicle",
            entityId: id,
            eventType: status === "inativo" ? "inactivated" : "status_changed",
            title: `Status alterado para ${VEHICLE_STATUS_META[status].label}`,
            description: reason,
            metadata: {
              vehicleId: id,
              clientId: vehicle.clientId,
              fromStatus: vehicle.status,
              toStatus: status,
            },
          });

          return {
            vehicles: state.vehicles.map((item) => (item.id === id ? { ...item, status } : item)),
            events: [...state.events, event],
          };
        }),
      deleteVehicle: (id) =>
        set((state) => {
          if (!canDeleteVehicle(id, state.quotes, state.serviceOrders, state.inspections)) {
            return {};
          }
          const vehicle = state.vehicles.find((item) => item.id === id);
          if (!vehicle) return {};

          const event = buildEntityEvent({
            entityType: "vehicle",
            entityId: id,
            eventType: "deleted",
            title: "Veículo excluído",
            description: `Veículo ${vehicle.code} (${vehicle.plate}) excluído.`,
            metadata: { vehicleId: id, clientId: vehicle.clientId },
          });

          return {
            vehicles: state.vehicles.filter((item) => item.id !== id),
            clients: state.clients.map((client) =>
              client.id === vehicle.clientId
                ? {
                    ...client,
                    vehicleIds: client.vehicleIds.filter((vehicleId) => vehicleId !== id),
                  }
                : client,
            ),
            events: [...state.events, event],
          };
        }),
    }),
    {
      name: "erp-data-store",
      version: 3,
      migrate: (persistedState, version) => {
        if (version < 3) {
          // Fase 2D introduziu múltiplas formas de pagamento (payments[]) em Contas a
          // Receber/Pagar — dados persistidos de versões anteriores são descartados em
          // favor dos mocks atuais.
          return {} as ErpDataState;
        }
        return persistedState as ErpDataState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
