"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** Nome do registro exibido na primeira etapa (ex: "o cliente Mariana Costa"). */
  itemLabel?: string;
  /** Palavra que o usuário deve digitar na segunda etapa. Padrão: "EXCLUIR". */
  confirmWord?: string;
};

/**
 * Dupla confirmação obrigatória para ações destrutivas (Fase 2C, item 8):
 * 1ª etapa avisa que a ação é irreversível (Cancelar/Continuar);
 * 2ª etapa exige que o usuário digite a palavra de confirmação.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  itemLabel,
  confirmWord = "EXCLUIR",
}: ConfirmDeleteDialogProps) {
  const [step, setStep] = useState<"warning" | "type-confirm">("warning");
  const [typedValue, setTypedValue] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setStep("warning");
      setTypedValue("");
    }
    onOpenChange(nextOpen);
  }

  function handleConfirm() {
    onConfirm();
    handleOpenChange(false);
  }

  const isConfirmValid = typedValue.trim().toUpperCase() === confirmWord.toUpperCase();

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        {step === "warning" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir registro</AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a excluir{itemLabel ? ` ${itemLabel}` : " este registro"}. Esta
                ação é irreversível.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => setStep("type-confirm")}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Digite {confirmWord} para confirmar a exclusão definitiva.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-delete-input">Confirmação</Label>
              <Input
                id="confirm-delete-input"
                value={typedValue}
                onChange={(event) => setTypedValue(event.target.value)}
                placeholder={confirmWord}
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleConfirm}
                disabled={!isConfirmValid}
              >
                Excluir definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
