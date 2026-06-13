"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { PaymentMethodConfig } from "@/lib/mock-data/settings";
import { useErpDataStore } from "@/stores/erp-data-store";

export function PaymentMethodsManager() {
  const configs = useErpDataStore((state) => state.paymentMethodConfigs);
  const updatePaymentMethodConfig = useErpDataStore((state) => state.updatePaymentMethodConfig);

  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig["method"] | undefined>(
    undefined,
  );
  const [editingLabel, setEditingLabel] = useState("");

  function saveEdit() {
    const label = editingLabel.trim();
    if (editingMethod && label) updatePaymentMethodConfig(editingMethod, { label });
    setEditingMethod(undefined);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formas de Pagamento</CardTitle>
        <CardDescription>
          Formas de pagamento disponíveis no Financeiro, Fluxo de Caixa, DRE e Relatórios. Apenas
          formas ativas aparecem nos formulários.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {configs.map((config) => (
          <div key={config.method} className="flex items-center gap-2 py-2">
            {editingMethod === config.method ? (
              <>
                <Input
                  value={editingLabel}
                  onChange={(event) => setEditingLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveEdit();
                    if (event.key === "Escape") setEditingMethod(undefined);
                  }}
                  autoFocus
                  className="min-w-0 flex-1"
                />
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={saveEdit}>
                    <Check />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingMethod(undefined)}>
                    <X />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${config.active ? "" : "text-muted-foreground line-through"}`}
                >
                  {config.label}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <Switch
                    checked={config.active}
                    onCheckedChange={(checked) =>
                      updatePaymentMethodConfig(config.method, { active: checked })
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingMethod(config.method);
                      setEditingLabel(config.label);
                    }}
                  >
                    <Pencil />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
