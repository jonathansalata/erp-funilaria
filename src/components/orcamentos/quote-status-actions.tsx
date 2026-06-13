"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, MessageSquare, Send, X } from "lucide-react";

import { ConvertToServiceOrderDialog } from "@/components/orcamentos/convert-to-service-order-dialog";
import { StatusOverrideAction } from "@/components/shared/status-override-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QUOTE_STATUS_META } from "@/lib/mock-data/quotes";
import type { Quote, QuoteStatus } from "@/lib/mock-data/quotes-data";
import { useErpDataStore } from "@/stores/erp-data-store";

type QuoteStatusActionsProps = {
  quote: Quote;
  status: QuoteStatus;
  onStatusChange: (status: QuoteStatus) => void;
};

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

const QUOTE_STATUS_OPTIONS = Object.entries(QUOTE_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.title,
}));

export function QuoteStatusActions({ quote, status, onStatusChange }: QuoteStatusActionsProps) {
  const router = useRouter();
  const createServiceOrderFromQuote = useErpDataStore((state) => state.createServiceOrderFromQuote);
  const createAppointment = useErpDataStore((state) => state.createAppointment);
  const changeQuoteStatus = useErpDataStore((state) => state.changeQuoteStatus);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  function handleConfirm() {
    pending?.onConfirm();
    setPending(null);
  }

  const dialog = (
    <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pending?.title}</DialogTitle>
          <DialogDescription>{pending?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPending(null)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>{pending?.confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const statusOverride = (
    <StatusOverrideAction
      currentStatus={status}
      options={QUOTE_STATUS_OPTIONS}
      entityLabel={`o orçamento ${quote.code}`}
      onConfirm={(newStatus, reason) =>
        changeQuoteStatus(quote.id, newStatus as QuoteStatus, reason)
      }
    />
  );

  let flowActions: React.ReactNode = null;

  if (status === "rascunho") {
    flowActions = (
      <Button
        onClick={() =>
          setPending({
            title: "Enviar orçamento",
            description: `Confirma o envio do orçamento ${quote.code} para o cliente?`,
            confirmLabel: "Enviar",
            onConfirm: () => {
              onStatusChange("enviado");
              toast.success("Orçamento enviado ao cliente.");
            },
          })
        }
      >
        <Send />
        Enviar orçamento
      </Button>
    );
  } else if (status === "enviado" || status === "em_negociacao") {
    flowActions = (
      <>
        {status === "enviado" && (
          <Button
            variant="outline"
            onClick={() =>
              setPending({
                title: "Negociar orçamento",
                description: `Marcar o orçamento ${quote.code} como em negociação com o cliente?`,
                confirmLabel: "Negociar",
                onConfirm: () => {
                  onStatusChange("em_negociacao");
                  toast.success("Orçamento em negociação com o cliente.");
                },
              })
            }
          >
            <MessageSquare />
            Negociar
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() =>
            setPending({
              title: "Recusar orçamento",
              description: `Confirma a recusa do orçamento ${quote.code}? Essa ação não pode ser desfeita.`,
              confirmLabel: "Recusar",
              onConfirm: () => {
                onStatusChange("recusado");
                toast.success("Orçamento marcado como recusado.");
              },
            })
          }
        >
          <X />
          Recusar
        </Button>
        <Button
          onClick={() =>
            setPending({
              title: "Aprovar orçamento",
              description: `Confirma a aprovação do orçamento ${quote.code} pelo cliente?`,
              confirmLabel: "Aprovar",
              onConfirm: () => {
                onStatusChange("aprovado");
                toast.success("Orçamento aprovado pelo cliente.");
              },
            })
          }
        >
          <Check />
          Aprovar
        </Button>
      </>
    );
  } else if (status === "aprovado") {
    flowActions = (
      <Button onClick={() => setConvertOpen(true)}>
        <ArrowRight />
        Converter em OS
      </Button>
    );
  }

  return (
    <>
      {flowActions}
      {statusOverride}
      {dialog}
      <ConvertToServiceOrderDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        quote={quote}
        onConfirm={({ dueDate, createAppointment: shouldCreateAppointment, time }) => {
          const serviceOrder = createServiceOrderFromQuote(quote.id, dueDate);
          if (shouldCreateAppointment && serviceOrder) {
            createAppointment({
              title: `Entrega — ${serviceOrder.code}`,
              type: "entrega",
              date: dueDate,
              time,
              clientId: quote.clientId,
              vehicleId: quote.vehicleId,
              serviceOrderId: serviceOrder.id,
            });
            toast.success("Ordem de Serviço criada e entrega agendada com sucesso.");
          } else {
            toast.success("Ordem de Serviço criada a partir do orçamento.");
          }
          router.push(
            serviceOrder ? `/ordens-servico/${serviceOrder.code.toLowerCase()}` : "/ordens-servico",
          );
        }}
      />
    </>
  );
}
