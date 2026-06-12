"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QUOTE_CATEGORY_LABELS,
  calculateQuoteTotal,
  type QuoteItem,
} from "@/lib/mock-data/quotes-data";
import { formatCurrency } from "@/lib/utils";

type QuoteItemsEditorProps = {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
};

export function QuoteItemsEditor({ items, onChange }: QuoteItemsEditorProps) {
  const totals = calculateQuoteTotal(items);

  function updateItem(id: string, patch: Partial<QuoteItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([
      ...items,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: "",
        category: "funilaria",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead className="text-right">Valor unit.</TableHead>
            <TableHead className="text-right">Desconto (%)</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const lineSubtotal = item.quantity * item.unitPrice;
            const lineDiscount = item.discount ? (lineSubtotal * item.discount) / 100 : 0;

            return (
              <TableRow key={item.id}>
                <TableCell className="min-w-48">
                  <Input
                    value={item.description}
                    placeholder="Descrição do item"
                    onChange={(event) => updateItem(item.id, { description: event.target.value })}
                  />
                </TableCell>
                <TableCell className="min-w-36">
                  <Select
                    value={item.category}
                    onValueChange={(value) =>
                      updateItem(item.id, { category: value as QuoteItem["category"] })
                    }
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QUOTE_CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min={1}
                    className="w-20 text-right"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, { quantity: Number(event.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-28 text-right"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.id, { unitPrice: Number(event.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 text-right"
                    value={item.discount ?? 0}
                    onChange={(event) =>
                      updateItem(item.id, { discount: Number(event.target.value) || 0 })
                    }
                  />
                </TableCell>
                <TableCell className="text-right font-medium whitespace-nowrap">
                  {formatCurrency(lineSubtotal - lineDiscount)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remover item"
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={addItem}>
        <Plus />
        Adicionar item
      </Button>

      <div className="flex flex-col gap-1 self-end text-sm">
        <div className="flex justify-between gap-8">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-muted-foreground">Descontos</span>
          <span>-{formatCurrency(totals.discountTotal)}</span>
        </div>
        <div className="font-heading flex justify-between gap-8 text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>
    </div>
  );
}
