"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CATALOG_META, type CatalogItem, type CatalogKey } from "@/lib/mock-data/settings";
import { useErpDataStore } from "@/stores/erp-data-store";

type CatalogManagerProps = {
  catalogKey: CatalogKey;
};

export function CatalogManager({ catalogKey }: CatalogManagerProps) {
  const meta = CATALOG_META[catalogKey];
  const items = useErpDataStore((state) => state.catalogs[catalogKey]);
  const createCatalogItem = useErpDataStore((state) => state.createCatalogItem);
  const updateCatalogItem = useErpDataStore((state) => state.updateCatalogItem);
  const toggleCatalogItemActive = useErpDataStore((state) => state.toggleCatalogItemActive);
  const deleteCatalogItem = useErpDataStore((state) => state.deleteCatalogItem);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [editingName, setEditingName] = useState("");
  const [deletingItem, setDeletingItem] = useState<CatalogItem | undefined>(undefined);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createCatalogItem(catalogKey, name);
    setNewName("");
  }

  function startEdit(item: CatalogItem) {
    setEditingId(item.id);
    setEditingName(item.name);
  }

  function saveEdit() {
    const name = editingName.trim();
    if (editingId && name) {
      updateCatalogItem(catalogKey, editingId, name);
    }
    setEditingId(undefined);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meta.title}</CardTitle>
        <CardDescription>{meta.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder={meta.placeholder}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleCreate();
            }}
            className="min-w-0"
          />
          <Button onClick={handleCreate} disabled={!newName.trim()} className="sm:w-fit">
            <Plus />
            Adicionar
          </Button>
        </div>

        <div className="flex flex-col divide-y">
          {items.length === 0 && (
            <p className="text-muted-foreground py-4 text-sm">
              Nenhum {meta.itemLabel.toLowerCase()} cadastrado.
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 py-2">
              {editingId === item.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveEdit();
                      if (event.key === "Escape") setEditingId(undefined);
                    }}
                    autoFocus
                    className="min-w-0 flex-1"
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
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${item.active ? "" : "text-muted-foreground line-through"}`}
                  >
                    {item.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <Switch
                      checked={item.active}
                      onCheckedChange={() => toggleCatalogItemActive(catalogKey, item.id)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => startEdit(item)}>
                      <Pencil />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeletingItem(item)}>
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
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(undefined)}
        onConfirm={() => {
          if (deletingItem) deleteCatalogItem(catalogKey, deletingItem.id);
        }}
        itemLabel={
          deletingItem ? `${meta.itemLabel.toLowerCase()} "${deletingItem.name}"` : undefined
        }
      />
    </Card>
  );
}
