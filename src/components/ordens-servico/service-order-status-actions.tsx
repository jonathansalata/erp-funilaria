"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, PackageSearch, Play, Truck } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_ORDER_STATUS_META } from "@/lib/mock-data/service-orders";
import type { ServiceOrder, ServiceOrderStatus } from "@/lib/mock-data/service-orders-data";
import { useErpDataStore } from "@/stores/erp-data-store";

type ServiceOrderStatusActionsProps = {
  order: ServiceOrder;
  status: ServiceOrderStatus;
  technicianId: string;
  onStatusChange: (status: ServiceOrderStatus) => void;
  onTechnicianChange: (technicianId: string) => void;
};

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

const SERVICE_ORDER_STATUS_OPTIONS = Object.entries(SERVICE_ORDER_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.title }),
);

export function ServiceOrderStatusActions({
  order,
  status,
  technicianId,
  onStatusChange,
  onTechnicianChange,
}: ServiceOrderStatusActionsProps) {
  const changeServiceOrderStatus = useErpDataStore((state) => state.changeServiceOrderStatus);
  const technicians = useErpDataStore((state) => state.technicians);
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

  const technicianSelect = (
    <Select value={technicianId} onValueChange={(value) => value && onTechnicianChange(value)}>
      <SelectTrigger size="sm" className="w-44">
        <SelectValue placeholder="Técnico" />
      </SelectTrigger>
      <SelectContent>
        {technicians
          .filter((technician) => technician.active || technician.id === technicianId)
          .map((technician) => (
            <SelectItem key={technician.id} value={technician.id}>
              {technician.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );

  let statusActions: React.ReactNode = null;

  if (status === "aguardando_inicio") {
    statusActions = (
      <Button
        onClick={() =>
          setPending({
            title: "Iniciar execução",
            description: `Confirma o início da execução da OS ${order.code}?`,
            confirmLabel: "Iniciar",
            onConfirm: () => {
              onStatusChange("em_execucao");
              toast.success("Execução iniciada.");
            },
          })
        }
      >
        <Play />
        Iniciar execução
      </Button>
    );
  } else if (status === "em_execucao") {
    statusActions = (
      <>
        <Button
          variant="outline"
          onClick={() =>
            setPending({
              title: "Aguardar peça",
              description: `Marcar a OS ${order.code} como aguardando chegada de peça?`,
              confirmLabel: "Confirmar",
              onConfirm: () => {
                onStatusChange("aguardando_peca");
                toast.success("OS marcada como aguardando peça.");
              },
            })
          }
        >
          <PackageSearch />
          Aguardar peça
        </Button>
        <Button
          onClick={() =>
            setPending({
              title: "Finalizar OS",
              description: `Confirma a finalização da OS ${order.code}? O veículo ficará pronto para retirada.`,
              confirmLabel: "Finalizar",
              onConfirm: () => {
                onStatusChange("finalizado");
                toast.success("OS finalizada. Veículo pronto para retirada.");
              },
            })
          }
        >
          <Check />
          Finalizar OS
        </Button>
      </>
    );
  } else if (status === "aguardando_peca") {
    statusActions = (
      <Button
        onClick={() =>
          setPending({
            title: "Retomar execução",
            description: `Confirma a retomada da execução da OS ${order.code}?`,
            confirmLabel: "Retomar",
            onConfirm: () => {
              onStatusChange("em_execucao");
              toast.success("Execução retomada.");
            },
          })
        }
      >
        <Play />
        Retomar execução
      </Button>
    );
  } else if (status === "finalizado") {
    statusActions = (
      <Button
        onClick={() =>
          setPending({
            title: "Entregar ao cliente",
            description: `Confirma a entrega do veículo da OS ${order.code} ao cliente?`,
            confirmLabel: "Entregar",
            onConfirm: () => {
              onStatusChange("entregue");
              toast.success("Veículo entregue ao cliente.");
            },
          })
        }
      >
        <Truck />
        Entregar ao cliente
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {technicianSelect}
      {statusActions}
      <StatusOverrideAction
        currentStatus={status}
        options={SERVICE_ORDER_STATUS_OPTIONS}
        entityLabel={`a OS ${order.code}`}
        onConfirm={(newStatus, reason) =>
          changeServiceOrderStatus(order.id, newStatus as ServiceOrderStatus, reason)
        }
      />
      {dialog}
    </div>
  );
}
