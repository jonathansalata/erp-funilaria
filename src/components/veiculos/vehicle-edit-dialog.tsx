"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FUEL_TYPE_LABELS, type FuelType, type Vehicle } from "@/lib/mock-data/vehicles";
import type { NewVehicleInput } from "@/stores/erp-data-store";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehicleEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle;
};

type VehicleFormValues = {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  chassi: string;
  renavam: string;
  mileage: string;
  fuel: FuelType | "";
  notes: string;
};

function vehicleToFormValues(vehicle: Vehicle): VehicleFormValues {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: String(vehicle.year),
    color: vehicle.color,
    chassi: vehicle.chassi ?? "",
    renavam: vehicle.renavam ?? "",
    mileage: String(vehicle.mileage),
    fuel: vehicle.fuel ?? "",
    notes: vehicle.notes ?? "",
  };
}

const EMPTY_VALUES: VehicleFormValues = {
  plate: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  chassi: "",
  renavam: "",
  mileage: "",
  fuel: "",
  notes: "",
};

export function VehicleEditDialog({ open, onOpenChange, vehicle }: VehicleEditDialogProps) {
  const updateVehicleDetails = useErpDataStore((state) => state.updateVehicleDetails);
  const [values, setValues] = useState<VehicleFormValues>(EMPTY_VALUES);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(vehicle ? vehicleToFormValues(vehicle) : EMPTY_VALUES);
    }
    onOpenChange(nextOpen);
  }

  if (!vehicle) return null;

  const isValid =
    values.plate.trim() !== "" && values.brand.trim() !== "" && values.model.trim() !== "";

  function handleSubmit() {
    if (!isValid || !vehicle) return;

    const input: Partial<NewVehicleInput> = {
      plate: values.plate.trim().toUpperCase(),
      brand: values.brand.trim(),
      model: values.model.trim(),
      year: Number(values.year) || vehicle.year,
      color: values.color.trim(),
      chassi: values.chassi.trim() || undefined,
      renavam: values.renavam.trim() || undefined,
      mileage: Number(values.mileage) || 0,
      fuel: values.fuel || undefined,
      notes: values.notes.trim() || undefined,
    };

    updateVehicleDetails(vehicle.id, input);
    toast.success("Cadastro do veículo atualizado com sucesso.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar veículo</DialogTitle>
          <DialogDescription>
            {vehicle.code} · As alterações geram um registro de auditoria.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-plate">Placa</Label>
            <Input
              id="edit-vehicle-plate"
              value={values.plate}
              onChange={(event) => setValues((v) => ({ ...v, plate: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-color">Cor</Label>
            <Input
              id="edit-vehicle-color"
              value={values.color}
              onChange={(event) => setValues((v) => ({ ...v, color: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-brand">Marca</Label>
            <Input
              id="edit-vehicle-brand"
              value={values.brand}
              onChange={(event) => setValues((v) => ({ ...v, brand: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-model">Modelo</Label>
            <Input
              id="edit-vehicle-model"
              value={values.model}
              onChange={(event) => setValues((v) => ({ ...v, model: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-year">Ano</Label>
            <Input
              id="edit-vehicle-year"
              type="number"
              value={values.year}
              onChange={(event) => setValues((v) => ({ ...v, year: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-mileage">KM atual</Label>
            <Input
              id="edit-vehicle-mileage"
              type="number"
              value={values.mileage}
              onChange={(event) => setValues((v) => ({ ...v, mileage: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-chassi">Chassi</Label>
            <Input
              id="edit-vehicle-chassi"
              value={values.chassi}
              onChange={(event) => setValues((v) => ({ ...v, chassi: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-renavam">Renavam</Label>
            <Input
              id="edit-vehicle-renavam"
              value={values.renavam}
              onChange={(event) => setValues((v) => ({ ...v, renavam: event.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-vehicle-fuel">Combustível</Label>
            <Select
              value={values.fuel || undefined}
              onValueChange={(value) =>
                setValues((v) => ({ ...v, fuel: (value as FuelType) || "" }))
              }
            >
              <SelectTrigger id="edit-vehicle-fuel" className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="edit-vehicle-notes">Observações</Label>
            <Textarea
              id="edit-vehicle-notes"
              value={values.notes}
              onChange={(event) => setValues((v) => ({ ...v, notes: event.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
