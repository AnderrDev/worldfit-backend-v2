import { EquipmentPort } from '../domain/equipment.port';
import { Equipment } from '../domain/entities/equipment';
import { BusinessError } from '../shared/business-error';

export class EquipmentApplication {
  private port: EquipmentPort;

  constructor(port: EquipmentPort) {
    this.port = port;
  }

  async createEquipment(equipment: Omit<Equipment, 'id'>): Promise<number> {
    const exists = await this.port.getEquipmentByName(equipment.name);
    if (exists) {
      throw new BusinessError('Ya existe un equipamiento con ese nombre', 409);
    }
    return this.port.createEquipment(equipment);
  }

  async updateEquipment(id: number, equipment: Partial<Equipment>): Promise<boolean> {
    const existing = await this.port.getEquipmentById(id);
    if (!existing) {
      throw new BusinessError('Equipamiento no encontrado', 404);
    }
    if (equipment.name && equipment.name !== existing.name) {
      const other = await this.port.getEquipmentByName(equipment.name);
      if (other && other.id !== id) {
        throw new BusinessError('Ya existe un equipamiento con ese nombre', 409);
      }
    }
    return this.port.updateEquipment(id, equipment);
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const existing = await this.port.getEquipmentById(id);
    if (!existing) {
      throw new BusinessError('Equipamiento no encontrado', 404);
    }
    return this.port.deleteEquipment(id);
  }

  async getEquipmentById(id: number): Promise<Equipment | null> {
    return this.port.getEquipmentById(id);
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return this.port.getAllEquipment();
  }
}
