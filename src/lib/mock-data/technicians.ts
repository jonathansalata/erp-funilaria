export type Technician = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export const TECHNICIANS: Technician[] = [
  { id: "tec-001", name: "Carlos Eduardo", role: "Funileiro", active: true },
  { id: "tec-002", name: "Diego Santos", role: "Pintor", active: true },
  { id: "tec-003", name: "Não atribuído", role: "", active: true },
];

export function getTechnicianById(id: string): Technician | undefined {
  return TECHNICIANS.find((technician) => technician.id === id);
}
