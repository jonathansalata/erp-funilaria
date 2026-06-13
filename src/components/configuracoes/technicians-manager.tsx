"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Technician } from "@/lib/mock-data/technicians";
import { useErpDataStore } from "@/stores/erp-data-store";

const EMPTY_FORM = { name: "", role: "" };

export function TechniciansManager() {
  const technicians = useErpDataStore((state) => state.technicians);
  const createTechnician = useErpDataStore((state) => state.createTechnician);
  const updateTechnician = useErpDataStore((state) => state.updateTechnician);
  const toggleTechnicianActive = useErpDataStore((state) => state.toggleTechnicianActive);
  const deleteTechnician = useErpDataStore((state) => state.deleteTechnician);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [editingForm, setEditingForm] = useState(EMPTY_FORM);
  const [deletingTechnician, setDeletingTechnician] = useState<Technician | undefined>(undefined);

  function handleCreate() {
    if (!form.name.trim() || !form.role.trim()) return;
    createTechnician({ name: form.name.trim(), role: form.role.trim() });
    setForm(EMPTY_FORM);
  }

  function startEdit(technician: Technician) {
    setEditingId(technician.id);
    setEditingForm({ name: technician.name, role: technician.role });
  }

  function saveEdit() {
    if (editingId && editingForm.name.trim() && editingForm.role.trim()) {
      updateTechnician(editingId, {
        name: editingForm.name.trim(),
        role: editingForm.role.trim(),
      });
    }
    setEditingId(undefined);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Técnicos</CardTitle>
        <CardDescription>
          Cadastro único de técnicos, consumido por Vistorias, Ordens de Serviço, Agenda e
          Relatórios.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_2fr_auto]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="technician-name">Nome</Label>
            <Input
              id="technician-name"
              placeholder="Nome completo"
              value={form.name}
              onChange={(event) => setForm((v) => ({ ...v, name: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="technician-role">Função</Label>
            <Input
              id="technician-role"
              placeholder="Ex.: Funileiro"
              value={form.role}
              onChange={(event) => setForm((v) => ({ ...v, role: event.target.value }))}
            />
          </div>
          <Button className="w-full sm:w-fit sm:self-end" onClick={handleCreate}>
            <Plus />
            Adicionar
          </Button>
        </div>

        <div className="flex flex-col divide-y">
          {technicians.map((technician) => (
            <div key={technician.id} className="flex flex-wrap items-center gap-2 py-2">
              {editingId === technician.id ? (
                <>
                  <Input
                    value={editingForm.name}
                    onChange={(event) =>
                      setEditingForm((v) => ({ ...v, name: event.target.value }))
                    }
                    className="min-w-0 flex-1 basis-full sm:basis-auto"
                    autoFocus
                  />
                  <Input
                    value={editingForm.role}
                    onChange={(event) =>
                      setEditingForm((v) => ({ ...v, role: event.target.value }))
                    }
                    className="min-w-0 flex-1 basis-full sm:basis-auto"
                  />
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={saveEdit}>
                      <Check />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(undefined)}>
                      <X />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`min-w-0 flex-1 truncate text-sm ${technician.active ? "" : "text-muted-foreground line-through"}`}
                  >
                    <span className="font-medium">{technician.name}</span>
                    <span className="text-muted-foreground"> — {technician.role}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Switch
                      checked={technician.active}
                      onCheckedChange={() => toggleTechnicianActive(technician.id)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => startEdit(technician)}>
                      <Pencil />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletingTechnician(technician)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <ConfirmDeleteDialog
        open={Boolean(deletingTechnician)}
        onOpenChange={(open) => !open && setDeletingTechnician(undefined)}
        onConfirm={() => {
          if (deletingTechnician) deleteTechnician(deletingTechnician.id);
        }}
        itemLabel={deletingTechnician ? `o técnico "${deletingTechnician.name}"` : undefined}
      />
    </Card>
  );
}
