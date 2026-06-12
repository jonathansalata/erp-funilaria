"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EntityHeader } from "@/components/shared/entity-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { ClientType } from "@/lib/mock-data/clients";
import { FUEL_TYPE_LABELS, type FuelType } from "@/lib/mock-data/vehicles";
import { useErpDataStore } from "@/stores/erp-data-store";

type VehicleEntry = {
  key: string;
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

function createEmptyVehicleEntry(): VehicleEntry {
  return {
    key: `veh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
}

export function NewClientForm() {
  const router = useRouter();
  const createClient = useErpDataStore((state) => state.createClient);

  const [type, setType] = useState<ClientType>("pessoa_fisica");

  // Pessoa física
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Pessoa jurídica
  const [razaoSocial, setRazaoSocial] = useState("");
  const [fantasyName, setFantasyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [stateRegistration, setStateRegistration] = useState("");
  const [responsibleName, setResponsibleName] = useState("");

  // Contato
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  // Endereço
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const [notes, setNotes] = useState("");

  // Veículos
  const [registerVehicleNow, setRegisterVehicleNow] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleEntry[]>([createEmptyVehicleEntry()]);

  function updateVehicle(key: string, patch: Partial<VehicleEntry>) {
    setVehicles((current) =>
      current.map((vehicle) => (vehicle.key === key ? { ...vehicle, ...patch } : vehicle)),
    );
  }

  function addVehicle() {
    setVehicles((current) => [...current, createEmptyVehicleEntry()]);
  }

  function removeVehicle(key: string) {
    setVehicles((current) => current.filter((vehicle) => vehicle.key !== key));
  }

  function buildAddressLine(): string {
    const parts = [
      street && number ? `${street}, ${number}` : street || number,
      complement,
      neighborhood,
      city && stateUf ? `${city} - ${stateUf}` : city || stateUf,
    ].filter(Boolean);
    return parts.join(" - ");
  }

  function handleSubmit() {
    const clientName = type === "pessoa_juridica" ? razaoSocial : name;
    const document = type === "pessoa_juridica" ? cnpj : cpf;

    if (!clientName.trim()) {
      toast.error(
        type === "pessoa_juridica" ? "Informe a razão social." : "Informe o nome completo.",
      );
      return;
    }
    if (!document.trim()) {
      toast.error(type === "pessoa_juridica" ? "Informe o CNPJ." : "Informe o CPF.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Informe o telefone de contato.");
      return;
    }

    const vehiclesToCreate = registerVehicleNow
      ? vehicles
          .filter((vehicle) => vehicle.plate.trim() && vehicle.brand.trim() && vehicle.model.trim())
          .map((vehicle) => ({
            plate: vehicle.plate.trim().toUpperCase(),
            brand: vehicle.brand.trim(),
            model: vehicle.model.trim(),
            year: Number(vehicle.year) || new Date().getFullYear(),
            color: vehicle.color.trim(),
            chassi: vehicle.chassi.trim() || undefined,
            renavam: vehicle.renavam.trim() || undefined,
            mileage: Number(vehicle.mileage) || 0,
            fuel: vehicle.fuel || undefined,
            notes: vehicle.notes.trim() || undefined,
          }))
      : [];

    if (registerVehicleNow && vehiclesToCreate.length === 0) {
      toast.error("Informe ao menos placa, marca e modelo do veículo ou desmarque a opção.");
      return;
    }

    const newClient = createClient({
      name: clientName.trim(),
      type,
      document: document.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim(),
      address: buildAddressLine(),
      zipCode: zipCode.trim() || undefined,
      street: street.trim() || undefined,
      number: number.trim() || undefined,
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim() || undefined,
      city: city.trim() || undefined,
      state: stateUf.trim() || undefined,
      rg: type === "pessoa_fisica" ? rg.trim() || undefined : undefined,
      birthDate: type === "pessoa_fisica" ? birthDate || undefined : undefined,
      fantasyName: type === "pessoa_juridica" ? fantasyName.trim() || undefined : undefined,
      stateRegistration:
        type === "pessoa_juridica" ? stateRegistration.trim() || undefined : undefined,
      responsibleName: type === "pessoa_juridica" ? responsibleName.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
      vehicles: vehiclesToCreate,
    });

    toast.success("Cliente cadastrado com sucesso.");
    router.push(`/clientes/${newClient.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <EntityHeader title="Novo Cliente" backHref="/clientes" />

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-type">Tipo de cliente</Label>
            <Select value={type} onValueChange={(value) => value && setType(value as ClientType)}>
              <SelectTrigger id="client-type" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoa_fisica">Pessoa física</SelectItem>
                <SelectItem value="pessoa_juridica">Pessoa jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "pessoa_fisica" ? (
            <>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="client-name">Nome completo</Label>
                <Input
                  id="client-name"
                  placeholder="Nome do cliente"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-cpf">CPF</Label>
                <Input
                  id="client-cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-rg">RG</Label>
                <Input
                  id="client-rg"
                  placeholder="00.000.000-0"
                  value={rg}
                  onChange={(event) => setRg(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-birth-date">Data de nascimento</Label>
                <Input
                  id="client-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="client-razao-social">Razão social</Label>
                <Input
                  id="client-razao-social"
                  placeholder="Nome da empresa"
                  value={razaoSocial}
                  onChange={(event) => setRazaoSocial(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-fantasy-name">Nome fantasia</Label>
                <Input
                  id="client-fantasy-name"
                  placeholder="Nome fantasia"
                  value={fantasyName}
                  onChange={(event) => setFantasyName(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-cnpj">CNPJ</Label>
                <Input
                  id="client-cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(event) => setCnpj(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-state-registration">Inscrição estadual</Label>
                <Input
                  id="client-state-registration"
                  placeholder="000.000.000.000"
                  value={stateRegistration}
                  onChange={(event) => setStateRegistration(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-responsible">Responsável</Label>
                <Input
                  id="client-responsible"
                  placeholder="Nome do responsável"
                  value={responsibleName}
                  onChange={(event) => setResponsibleName(event.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-phone">Telefone</Label>
            <Input
              id="client-phone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-whatsapp">WhatsApp</Label>
            <Input
              id="client-whatsapp"
              placeholder="(00) 00000-0000"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-zip">CEP</Label>
            <Input
              id="client-zip"
              placeholder="00000-000"
              value={zipCode}
              onChange={(event) => setZipCode(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="client-street">Endereço</Label>
            <Input
              id="client-street"
              placeholder="Rua, avenida..."
              value={street}
              onChange={(event) => setStreet(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-number">Número</Label>
            <Input
              id="client-number"
              placeholder="123"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-complement">Complemento</Label>
            <Input
              id="client-complement"
              placeholder="Apto, bloco..."
              value={complement}
              onChange={(event) => setComplement(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-neighborhood">Bairro</Label>
            <Input
              id="client-neighborhood"
              placeholder="Bairro"
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-city">Cidade</Label>
            <Input
              id="client-city"
              placeholder="Cidade"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="client-state">Estado</Label>
            <Input
              id="client-state"
              placeholder="UF"
              maxLength={2}
              value={stateUf}
              onChange={(event) => setStateUf(event.target.value.toUpperCase())}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="register-vehicle-now"
              checked={registerVehicleNow}
              onCheckedChange={(checked) => setRegisterVehicleNow(checked === true)}
            />
            <Label htmlFor="register-vehicle-now">Cadastrar veículo agora</Label>
          </div>

          {registerVehicleNow && (
            <div className="flex flex-col gap-4">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.key} className="flex flex-col gap-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Veículo {index + 1}</p>
                    {vehicles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVehicle(vehicle.key)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-plate-${vehicle.key}`}>Placa</Label>
                      <Input
                        id={`vehicle-plate-${vehicle.key}`}
                        placeholder="ABC1D23"
                        value={vehicle.plate}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { plate: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-brand-${vehicle.key}`}>Marca</Label>
                      <Input
                        id={`vehicle-brand-${vehicle.key}`}
                        placeholder="Marca"
                        value={vehicle.brand}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { brand: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-model-${vehicle.key}`}>Modelo</Label>
                      <Input
                        id={`vehicle-model-${vehicle.key}`}
                        placeholder="Modelo"
                        value={vehicle.model}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { model: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-year-${vehicle.key}`}>Ano</Label>
                      <Input
                        id={`vehicle-year-${vehicle.key}`}
                        type="number"
                        placeholder="2024"
                        value={vehicle.year}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { year: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-color-${vehicle.key}`}>Cor</Label>
                      <Input
                        id={`vehicle-color-${vehicle.key}`}
                        placeholder="Cor"
                        value={vehicle.color}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { color: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-mileage-${vehicle.key}`}>KM atual</Label>
                      <Input
                        id={`vehicle-mileage-${vehicle.key}`}
                        type="number"
                        placeholder="0"
                        value={vehicle.mileage}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { mileage: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-chassi-${vehicle.key}`}>Chassi</Label>
                      <Input
                        id={`vehicle-chassi-${vehicle.key}`}
                        placeholder="Chassi"
                        value={vehicle.chassi}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { chassi: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-renavam-${vehicle.key}`}>Renavam</Label>
                      <Input
                        id={`vehicle-renavam-${vehicle.key}`}
                        placeholder="Renavam"
                        value={vehicle.renavam}
                        onChange={(event) =>
                          updateVehicle(vehicle.key, { renavam: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`vehicle-fuel-${vehicle.key}`}>Combustível</Label>
                      <Select
                        value={vehicle.fuel || undefined}
                        onValueChange={(value) =>
                          updateVehicle(vehicle.key, { fuel: (value as FuelType) || "" })
                        }
                      >
                        <SelectTrigger id={`vehicle-fuel-${vehicle.key}`} className="w-full">
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
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`vehicle-notes-${vehicle.key}`}>Observações</Label>
                    <Textarea
                      id={`vehicle-notes-${vehicle.key}`}
                      placeholder="Observações sobre o veículo..."
                      value={vehicle.notes}
                      onChange={(event) =>
                        updateVehicle(vehicle.key, { notes: event.target.value })
                      }
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addVehicle} className="w-fit">
                <Plus className="size-4" />
                Adicionar outro veículo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações sobre o cliente..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/clientes")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>Cadastrar cliente</Button>
      </div>
    </div>
  );
}
