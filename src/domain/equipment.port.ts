import { Equipment } from './entities/equipment';

export interface EquipmentPort {
  createEquipment(equipment: Omit<Equipment, 'id'>): Promise<number>;
  updateEquipment(id: number, equipment: Partial<Equipment>): Promise<boolean>;
  deleteEquipment(id: number): Promise<boolean>; // borrado logico
  getEquipmentById(id: number): Promise<Equipment | null>;
  getEquipmentByName(name: string): Promise<Equipment | null>;
  getAllEquipment(): Promise<Equipment[]>;
}
