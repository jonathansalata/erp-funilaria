import { slugify } from "@/lib/utils";
import type { Client } from "@/lib/mock-data/clients";
import type { Vehicle } from "@/lib/mock-data/vehicles";

/** Bloco 40 — slugs amigáveis para `/clientes/[slug]` e `/veiculos/[slug]`. */

export function getClientSlug(client: Client, clients: Client[]): string {
  const base = slugify(client.name) || client.code.toLowerCase();
  const hasDuplicate = clients.some(
    (other) => other.id !== client.id && (slugify(other.name) || other.code.toLowerCase()) === base,
  );
  return hasDuplicate ? `${base}-${client.code.toLowerCase()}` : base;
}

export function findClientBySlug(clients: Client[], slug: string): Client | undefined {
  return (
    clients.find((client) => getClientSlug(client, clients) === slug) ??
    clients.find((client) => client.id === slug)
  );
}

function platePart(plate: string): string {
  return plate.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getVehicleSlug(vehicle: Vehicle, vehicles: Vehicle[]): string {
  const plate = platePart(vehicle.plate);
  const hasDuplicate = vehicles.some(
    (other) => other.id !== vehicle.id && platePart(other.plate) === plate,
  );
  return hasDuplicate ? `${slugify(`${vehicle.brand} ${vehicle.model}`)}-${plate}` : plate;
}

export function findVehicleBySlug(vehicles: Vehicle[], slug: string): Vehicle | undefined {
  return (
    vehicles.find((vehicle) => getVehicleSlug(vehicle, vehicles) === slug) ??
    vehicles.find((vehicle) => vehicle.id === slug)
  );
}
