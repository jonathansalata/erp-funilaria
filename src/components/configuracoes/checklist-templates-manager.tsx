"use client";

import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CHECKLIST_TEMPLATE_KIND_LABELS,
  type ChecklistTemplate,
  type ChecklistTemplateKind,
  type ChecklistTemplateStage,
} from "@/lib/mock-data/checklist-templates";
import { useErpDataStore } from "@/stores/erp-data-store";

type ChecklistTemplatesManagerProps = {
  kind: ChecklistTemplateKind;
};

function createEmptyStage(): ChecklistTemplateStage {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: `stage-${suffix}`,
    name: "",
    items: [{ id: `item-${suffix}`, label: "" }],
  };
}

export function ChecklistTemplatesManager({ kind }: ChecklistTemplatesManagerProps) {
  const templates = useErpDataStore((state) =>
    state.checklistTemplates.filter((template) => template.kind === kind),
  );
  const createChecklistTemplate = useErpDataStore((state) => state.createChecklistTemplate);
  const updateChecklistTemplate = useErpDataStore((state) => state.updateChecklistTemplate);
  const duplicateChecklistTemplate = useErpDataStore((state) => state.duplicateChecklistTemplate);
  const toggleChecklistTemplateActive = useErpDataStore(
    (state) => state.toggleChecklistTemplateActive,
  );
  const deleteChecklistTemplate = useErpDataStore((state) => state.deleteChecklistTemplate);

  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStages, setEditingStages] = useState<ChecklistTemplateStage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<ChecklistTemplate | undefined>(
    undefined,
  );

  const kindLabel = CHECKLIST_TEMPLATE_KIND_LABELS[kind];

  function openCreateDialog() {
    setIsCreating(true);
    setEditingTemplate(null);
    setEditingName("");
    setEditingStages([createEmptyStage()]);
  }

  function openEditDialog(template: ChecklistTemplate) {
    setIsCreating(false);
    setEditingTemplate(template);
    setEditingName(template.name);
    setEditingStages(template.stages.map((stage) => ({ ...stage, items: [...stage.items] })));
  }

  function closeDialog() {
    setEditingTemplate(null);
    setIsCreating(false);
  }

  function updateStageName(stageId: string, name: string) {
    setEditingStages((stages) =>
      stages.map((stage) => (stage.id === stageId ? { ...stage, name } : stage)),
    );
  }

  function removeStage(stageId: string) {
    setEditingStages((stages) => stages.filter((stage) => stage.id !== stageId));
  }

  function addStage() {
    setEditingStages((stages) => [...stages, createEmptyStage()]);
  }

  function updateItemLabel(stageId: string, itemId: string, label: string) {
    setEditingStages((stages) =>
      stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              items: stage.items.map((item) => (item.id === itemId ? { ...item, label } : item)),
            }
          : stage,
      ),
    );
  }

  function removeItem(stageId: string, itemId: string) {
    setEditingStages((stages) =>
      stages.map((stage) =>
        stage.id === stageId
          ? { ...stage, items: stage.items.filter((item) => item.id !== itemId) }
          : stage,
      ),
    );
  }

  function addItem(stageId: string) {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setEditingStages((stages) =>
      stages.map((stage) =>
        stage.id === stageId
          ? { ...stage, items: [...stage.items, { id: `item-${suffix}`, label: "" }] }
          : stage,
      ),
    );
  }

  function handleSave() {
    const name = editingName.trim();
    if (!name) {
      toast.error("Informe um nome para o template.");
      return;
    }

    const stages = editingStages
      .map((stage) => ({
        ...stage,
        name: stage.name.trim(),
        items: stage.items
          .map((item) => ({ ...item, label: item.label.trim() }))
          .filter((item) => item.label.length > 0),
      }))
      .filter((stage) => stage.name.length > 0 && stage.items.length > 0);

    if (stages.length === 0) {
      toast.error("Inclua ao menos uma etapa com um item preenchido.");
      return;
    }

    if (isCreating) {
      createChecklistTemplate({ kind, name, stages });
      toast.success("Template criado com sucesso.");
    } else if (editingTemplate) {
      updateChecklistTemplate(editingTemplate.id, { name, stages });
      toast.success("Template atualizado com sucesso.");
    }

    closeDialog();
  }

  function handleDuplicate(template: ChecklistTemplate) {
    duplicateChecklistTemplate(template.id);
    toast.success("Template duplicado com sucesso.");
  }

  function handleDelete() {
    if (!deletingTemplate) return;
    const deleted = deleteChecklistTemplate(deletingTemplate.id);
    if (!deleted) {
      toast.error("Não é possível excluir o único template deste tipo.");
    } else {
      toast.success("Template excluído com sucesso.");
    }
    setDeletingTemplate(undefined);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <CardTitle>{kindLabel}</CardTitle>
          <CardDescription>
            Estrutura em etapas e itens utilizada ao gerar checklists de {kindLabel.toLowerCase()}.
          </CardDescription>
        </div>
        <Button size="sm" onClick={openCreateDialog} className="w-full sm:w-fit">
          <Plus />
          Novo template
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {templates.length === 0 && (
          <p className="text-muted-foreground py-4 text-sm">Nenhum template cadastrado.</p>
        )}
        {templates.map((template) => (
          <div key={template.id} className="flex flex-wrap items-center gap-2 py-3">
            <div className="min-w-0 flex-1 basis-full sm:basis-auto">
              <p
                className={`truncate text-sm font-medium ${template.active ? "" : "text-muted-foreground line-through"}`}
              >
                {template.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {template.stages.length} etapa(s) ·{" "}
                {template.stages.reduce((total, stage) => total + stage.items.length, 0)} item(ns)
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Switch
                checked={template.active}
                onCheckedChange={() => toggleChecklistTemplateActive(template.id)}
              />
              <Button size="icon" variant="ghost" onClick={() => openEditDialog(template)}>
                <Pencil />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDuplicate(template)}>
                <Copy />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setDeletingTemplate(template)}>
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog
        open={isCreating || Boolean(editingTemplate)}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-h-[85vh] w-full overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Novo template" : "Editar template"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template-name">Nome do template</Label>
              <Input
                id="template-name"
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                placeholder={`Ex.: Checklist padrão de ${kindLabel.toLowerCase()}`}
                className="min-w-0"
              />
            </div>

            <div className="flex flex-col gap-3">
              {editingStages.map((stage) => (
                <div key={stage.id} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={stage.name}
                      onChange={(event) => updateStageName(stage.id, event.target.value)}
                      placeholder="Nome da etapa"
                      className="min-w-0 flex-1 font-medium"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => removeStage(stage.id)}
                      aria-label="Remover etapa"
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    {stage.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Input
                          value={item.label}
                          onChange={(event) =>
                            updateItemLabel(stage.id, item.id, event.target.value)
                          }
                          placeholder="Descrição do item"
                          className="min-w-0 flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0"
                          onClick={() => removeItem(stage.id, item.id)}
                          aria-label="Remover item"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => addItem(stage.id)}
                    >
                      <Plus />
                      Adicionar item
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={addStage}
              >
                <Plus />
                Adicionar etapa
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deletingTemplate)}
        onOpenChange={(open) => !open && setDeletingTemplate(undefined)}
        onConfirm={handleDelete}
        itemLabel={deletingTemplate ? `template "${deletingTemplate.name}"` : undefined}
      />
    </Card>
  );
}
