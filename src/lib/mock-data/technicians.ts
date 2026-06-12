export type Technician = {
  id: string;
  name: string;
  role: string;
};

export const TECHNICIANS: Technician[] = [
  { id: "tec-001", name: "Carlos Eduardo", role: "Funileiro" },
  { id: "tec-002", name: "Diego Santos", role: "Pintor" },
  { id: "tec-003", name: "Não atribuído", role: "" },
];

export function getTechnicianById(id: string): Technician | undefined {
  return TECHNICIANS.find((technician) => technician.id === id);
}
