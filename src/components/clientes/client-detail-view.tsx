"use client";

import { notFound } from "next/navigation";

import { ClientDetail } from "@/components/clientes/client-detail";
import { findClientBySlug } from "@/lib/slugs";
import { useErpDataStore } from "@/stores/erp-data-store";

export function ClientDetailView({ id }: { id: string }) {
  const hasHydrated = useErpDataStore((state) => state.hasHydrated);
  const clients = useErpDataStore((state) => state.clients);
  const client = findClientBySlug(clients, id);

  if (!hasHydrated) {
    return null;
  }

  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} />;
}
