"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Quote, QuoteStatus } from "@/lib/mock-data/quotes-data";

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

export function QuoteStatusActions({ quote, status, onStatusChange }: QuoteStatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);

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

  if (status === "rascunho") {
    return (
      <>
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
        {dialog}
      </>
    );
  }

  if (status === "enviado" || status === "em_negociacao") {
    return (
      <>
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
        {dialog}
      </>
    );
  }

  if (status === "aprovado") {
    return (
      <>
        <Button
          onClick={() =>
            setPending({
              title: "Converter em Ordem de Serviço",
              description: `Confirma a conversão do orçamento ${quote.code} em uma Ordem de Serviço?`,
              confirmLabel: "Converter",
              onConfirm: () => {
                toast.success("Ordem de Serviço criada a partir do orçamento.");
                router.push(
                  quote.convertedServiceOrderId
                    ? `/ordens-servico/${quote.convertedServiceOrderId}`
                    : "/ordens-servico",
                );
              },
            })
          }
        >
          <ArrowRight />
          Converter em OS
        </Button>
        {dialog}
      </>
    );
  }

  return null;
}
