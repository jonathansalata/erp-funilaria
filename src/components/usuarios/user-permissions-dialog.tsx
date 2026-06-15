"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MODULE_KEYS,
  MODULE_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  emptyPermissionMatrix,
  type PermissionMatrix,
} from "@/lib/mock-data/users";
import type { ApiUser } from "@/lib/auth/usuarios-types";

type UserPermissionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: ApiUser;
};

export function UserPermissionsDialog({ open, onOpenChange, user }: UserPermissionsDialogProps) {
  const [matrix, setMatrix] = useState<PermissionMatrix>(emptyPermissionMatrix());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  if (open && user && user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    setMatrix(emptyPermissionMatrix());
    setIsLoading(true);

    fetch(`/api/usuarios/${user.id}/permissions`)
      .then((res) => res.json())
      .then((data) => {
        const overrides = (data.overrides ?? []) as {
          module: string;
          action: string;
          allowed: boolean;
        }[];
        setMatrix((current) => {
          const next = emptyPermissionMatrix();
          for (const moduleKey of MODULE_KEYS) {
            next[moduleKey] = { ...current[moduleKey] };
          }
          for (const override of overrides) {
            const moduleKey = override.module as keyof PermissionMatrix;
            if (next[moduleKey] && override.action in next[moduleKey]) {
              (next[moduleKey] as Record<string, boolean>)[override.action] = override.allowed;
            }
          }
          return next;
        });
      })
      .catch(() => toast.error("Não foi possível carregar as permissões."))
      .finally(() => setIsLoading(false));
  }

  if (!open && loadedUserId !== null) {
    setLoadedUserId(null);
  }

  function toggle(
    moduleKey: (typeof MODULE_KEYS)[number],
    action: (typeof PERMISSION_ACTIONS)[number],
  ) {
    setMatrix((current) => ({
      ...current,
      [moduleKey]: { ...current[moduleKey], [action]: !current[moduleKey][action] },
    }));
  }

  async function handleSubmit() {
    if (!user) return;

    setIsSaving(true);
    const response = await fetch(`/api/usuarios/${user.id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrix }),
    });
    setIsSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast.error(data.error ?? "Não foi possível salvar as permissões.");
      return;
    }

    toast.success("Permissões atualizadas com sucesso.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Permissões — {user?.full_name}</DialogTitle>
          <DialogDescription>
            Permissões granulares por módulo, aplicadas como sobreposição ao perfil do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-background sticky left-0">Módulo</TableHead>
                {PERMISSION_ACTIONS.map((action) => (
                  <TableHead key={action} className="text-center whitespace-nowrap">
                    {PERMISSION_ACTION_LABELS[action]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODULE_KEYS.map((moduleKey) => (
                <TableRow key={moduleKey}>
                  <TableCell className="bg-background sticky left-0 font-medium whitespace-nowrap">
                    {MODULE_LABELS[moduleKey]}
                  </TableCell>
                  {PERMISSION_ACTIONS.map((action) => (
                    <TableCell key={action} className="text-center">
                      <Checkbox
                        checked={matrix[moduleKey]?.[action] ?? false}
                        disabled={isLoading}
                        onCheckedChange={() => toggle(moduleKey, action)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || isSaving}>
            {isSaving ? "Salvando..." : "Salvar permissões"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
