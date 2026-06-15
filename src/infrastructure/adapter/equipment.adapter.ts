import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Equipment as EquipmentEntity } from '../entities/Equipment';
import { Equipment as EquipmentDomain } from '../../domain/entities/equipment';
import { EquipmentPort } from '../../domain/equipment.port';

export class EquipmentAdapter implements EquipmentPort {
  private equipmentRepository: Repository<EquipmentEntity>;

  constructor() {
    this.equipmentRepository = AppDataSource.getRepository(EquipmentEntity);
  }

  private toDomain(equipment: EquipmentEntity): EquipmentDomain {
    return {
      id: equipment.id_equipment,
      name: equipment.name_equipment,
      description: equipment.description,
      status: equipment.status_equipment,
    };
  }

  private toEntity(equipment: Omit<EquipmentDomain, 'id'>): EquipmentEntity {
    const entity = new EquipmentEntity();
    entity.name_equipment = equipment.name;
    entity.description = equipment.description;
    entity.status_equipment = equipment.status ?? 1;
    return entity;
  }

  async createEquipment(equipment: Omit<EquipmentDomain, 'id'>): Promise<number> {
    try {
      const saved = await this.equipmentRepository.save(this.toEntity(equipment));
      return saved.id_equipment;
    } catch (error) {
      throw new Error('Error al crear el equipamiento');
    }
  }

  async updateEquipment(id: number, equipment: Partial<EquipmentDomain>): Promise<boolean> {
    try {
      const existing = await this.equipmentRepository.findOne({ where: { id_equipment: id } });
      if (!existing) return false;

      if (equipment.name != null) existing.name_equipment = equipment.name;
      if (equipment.description != null) existing.description = equipment.description;
      if (equipment.status != null) existing.status_equipment = equipment.status;

      await this.equipmentRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el equipamiento');
    }
  }

  // BORRADO LOGICO: status en 0
  async deleteEquipment(id: number): Promise<boolean> {
    try {
      const existing = await this.equipmentRepository.findOne({ where: { id_equipment: id } });
      if (!existing) return false;
      existing.status_equipment = 0;
      await this.equipmentRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar el equipamiento');
    }
  }

  async getEquipmentById(id: number): Promise<EquipmentDomain | null> {
    try {
      const equipment = await this.equipmentRepository.findOne({ where: { id_equipment: id, status_equipment: 1 } });
      return equipment ? this.toDomain(equipment) : null;
    } catch (error) {
      throw new Error('Error al obtener el equipamiento');
    }
  }

  async getEquipmentByName(name: string): Promise<EquipmentDomain | null> {
    try {
      const equipment = await this.equipmentRepository.findOne({ where: { name_equipment: name, status_equipment: 1 } });
      return equipment ? this.toDomain(equipment) : null;
    } catch (error) {
      throw new Error('Error al obtener el equipamiento');
    }
  }

  async getAllEquipment(): Promise<EquipmentDomain[]> {
    try {
      const equipment = await this.equipmentRepository.find({ where: { status_equipment: 1 } });
      return equipment.map((e) => this.toDomain(e));
    } catch (error) {
      throw new Error('Error al obtener el equipamiento');
    }
  }
}
