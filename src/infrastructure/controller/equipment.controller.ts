import { Request, Response } from 'express';
import { EquipmentApplication } from '../../application/equipment.application';
import { validateEquipmentData } from '../util/equipment-validation';
import { validateEquipmentUpdate } from '../util/equipment-update-validation';
import { BusinessError } from '../../shared/business-error';

export class EquipmentController {
  private app: EquipmentApplication;

  constructor(app: EquipmentApplication) {
    this.app = app;
  }

  async createEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const { error, value } = validateEquipmentData(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const equipmentId = await this.app.createEquipment(value);
      return res.status(201).json({ message: 'Equipamiento creado con exito', equipmentId });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getAllEquipment(_req: Request, res: Response): Promise<Response> {
    try {
      const equipment = await this.app.getAllEquipment();
      return res.status(200).json(equipment);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getEquipmentById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const equipment = await this.app.getEquipmentById(id);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipamiento no encontrado' });
      }
      return res.status(200).json(equipment);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async updateEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const { error, value } = validateEquipmentUpdate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      await this.app.updateEquipment(id, value);
      return res.status(200).json({ message: 'Equipamiento actualizado correctamente' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteEquipment(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      await this.app.deleteEquipment(id);
      return res.status(200).json({ message: 'Equipamiento dado de baja' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
