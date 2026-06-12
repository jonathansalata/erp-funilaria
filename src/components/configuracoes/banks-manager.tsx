"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BankAccount } from "@/lib/mock-data/settings";
import { useErpDataStore } from "@/stores/erp-data-store";

const EMPTY_FORM = { bankName: "", agency: "", account: "" };

export function BanksManager() {
  const banks = useErpDataStore((state) => state.banks);
  const createBank = useErpDataStore((state) => state.createBank);
  const toggleBankActive = useErpDataStore((state) => state.toggleBankActive);
  const deleteBank = useErpDataStore((state) => state.deleteBank);

  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingBank, setDeletingBank] = useState<BankAccount | undefined>(undefined);

  function handleCreate() {
    if (!form.bankName.trim() || !form.agency.trim() || !form.account.trim()) return;
    createBank({
      bankName: form.bankName.trim(),
      agency: form.agency.trim(),
      account: form.account.trim(),
    });
    setForm(EMPTY_FORM);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bancos</CardTitle>
        <CardDescription>Contas bancárias da empresa, utilizadas no Financeiro.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bank-name">Banco</Label>
            <Input
              id="bank-name"
              placeholder="Ex.: Banco do Brasil"
              value={form.bankName}
              onChange={(event) => setForm((v) => ({ ...v, bankName: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bank-agency">Agência</Label>
            <Input
              id="bank-agency"
              placeholder="0000-0"
              value={form.agency}
              onChange={(event) => setForm((v) => ({ ...v, agency: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bank-account">Conta</Label>
            <Input
              id="bank-account"
              placeholder="00000-0"
              value={form.account}
              onChange={(event) => setForm((v) => ({ ...v, account: event.target.value }))}
            />
          </div>
          <Button className="self-end" onClick={handleCreate}>
            <Plus />
            Adicionar
          </Button>
        </div>

        <div className="flex flex-col divide-y">
          {banks.length === 0 && (
            <p className="text-muted-foreground py-4 text-sm">Nenhum banco cadastrado.</p>
          )}
          {banks.map((bank) => (
            <div key={bank.id} className="flex items-center gap-3 py-2">
              <div
                className={`flex-1 text-sm ${bank.active ? "" : "text-muted-foreground line-through"}`}
              >
                <span className="font-medium">{bank.bankName}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — Ag. {bank.agency} / Conta {bank.account}
                </span>
              </div>
              <Switch checked={bank.active} onCheckedChange={() => toggleBankActive(bank.id)} />
              <Button size="icon-sm" variant="ghost" onClick={() => setDeletingBank(bank)}>
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <ConfirmDeleteDialog
        open={Boolean(deletingBank)}
        onOpenChange={(open) => !open && setDeletingBank(undefined)}
        onConfirm={() => {
          if (deletingBank) deleteBank(deletingBank.id);
        }}
        itemLabel={deletingBank ? `o banco "${deletingBank.bankName}"` : undefined}
      />
    </Card>
  );
}
