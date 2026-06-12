"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Inspection, InspectionStatus } from "@/lib/mock-data/inspections";

type InspectionStatusActionsProps = {
  inspection: Inspection;
  status: InspectionStatus;
  onStatusChange: (status: InspectionStatus) => void;
};

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

export function InspectionStatusActions({
  inspection,
  status,
  onStatusChange,
}: InspectionStatusActionsProps) {
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

  if (status === "pendente" || status === "em_andamento") {
    return (
      <>
        <Button
          onClick={() =>
            setPending({
              title: "Concluir vistoria",
              description: `Confirma a conclusão da vistoria ${inspection.code}?`,
              confirmLabel: "Concluir",
              onConfirm: () => {
                onStatusChange("concluida");
                toast.success("Vistoria concluída.");
              },
            })
          }
        >
          <Check />
          Concluir vistoria
        </Button>
        {dialog}
      </>
    );
  }

  if (status === "concluida" && !inspection.convertedQuoteId) {
    return (
      <>
        <Button
          onClick={() =>
            setPending({
              title: "Gerar orçamento",
              description: `Confirma a geração de um orçamento a partir da vistoria ${inspection.code}?`,
              confirmLabel: "Gerar orçamento",
              onConfirm: () => {
                toast.success("Orçamento gerado a partir da vistoria.");
                router.push(
                  `/orcamentos/novo?clientId=${inspection.clientId}&vehicleId=${inspection.vehicleId}&inspectionId=${inspection.id}`,
                );
              },
            })
          }
        >
          <FileText />
          Gerar orçamento
        </Button>
        {dialog}
      </>
    );
  }

  return null;
}
