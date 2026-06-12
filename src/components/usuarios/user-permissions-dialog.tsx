"use client";

import { useState } from "react";

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
  type PermissionMatrix,
  type User,
} from "@/lib/mock-data/users";

type UserPermissionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSubmit: (permissions: PermissionMatrix) => void;
};

export function UserPermissionsDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserPermissionsDialogProps) {
  const [matrix, setMatrix] = useState<PermissionMatrix | undefined>(user?.permissions);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setMatrix(user?.permissions);
  }

  function toggle(
    moduleKey: (typeof MODULE_KEYS)[number],
    action: (typeof PERMISSION_ACTIONS)[number],
  ) {
    setMatrix((current) => {
      if (!current) return current;
      return {
        ...current,
        [moduleKey]: { ...current[moduleKey], [action]: !current[moduleKey][action] },
      };
    });
  }

  function handleSubmit() {
    if (!matrix) return;
    onSubmit(matrix);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Permissões — {user?.name}</DialogTitle>
          <DialogDescription>
            Permissões granulares por módulo. Estrutura preparada para futuro RBAC real.
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
                        checked={matrix?.[moduleKey]?.[action] ?? false}
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
          <Button onClick={handleSubmit}>Salvar permissões</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
