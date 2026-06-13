"use client";

import { notFound } from "next/navigation";

import { ClientDetail } from "@/components/clientes/client-detail";
import { useErpDataStore } from "@/stores/erp-data-store";

export function ClientDetailView({ id }: { id: string }) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const client = useErpDataStore((state) => state.clients.find((item) => item.id === id));

  if (!hasHydrated) {
    return null;
  }

  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} />;
}
