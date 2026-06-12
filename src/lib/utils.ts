import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: ptBR, addSuffix: true });
}

/** Gera e baixa um arquivo CSV a partir de cabeçalhos e linhas de dados. */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
): void {
  const escapeCell = (cell: string | number) => {
    const text = String(cell);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(";"));
  const csvContent = `﻿${lines.join("\n")}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
