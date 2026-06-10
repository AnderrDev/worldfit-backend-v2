import { Request, Response } from 'express';
import { RoutineApplication } from '../../application/routine.application';
import { validateRoutineData } from '../util/routine-validation';
import { validateRoutineUpdate } from '../util/routine-update-validation';
import { BusinessError } from '../../shared/business-error';

export class RoutineController {
  private app: RoutineApplication;

  constructor(app: RoutineApplication) {
    this.app = app;
  }

  async createRoutine(req: Request, res: Response): Promise<Response> {
    try {
      const { error, value } = validateRoutineData(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const routineId = await this.app.createRoutine(value as any);
      return res.status(201).json({ message: 'Rutina creada con exito', routineId });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getAllRoutines(_req: Request, res: Response): Promise<Response> {
    try {
      const routines = await this.app.getAllRoutines();
      return res.status(200).json(routines);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getRoutineById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const routine = await this.app.getRoutineById(id);
      if (!routine) {
        return res.status(404).json({ message: 'Rutina no encontrada' });
      }
      return res.status(200).json(routine);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async updateRoutine(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const { error, value } = validateRoutineUpdate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const updated = await this.app.updateRoutine(id, value as any);
      if (!updated) {
        return res.status(404).json({ message: 'Rutina no encontrada o sin cambios' });
      }
      return res.status(200).json({ message: 'Rutina actualizada correctamente' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ---- Flujo de aprobacion: el usuario asignado acepta o rechaza la rutina ----

  async acceptRoutine(req: Request, res: Response): Promise<Response> {
    return this.decidir(req, res, 'accept');
  }

  async rejectRoutine(req: Request, res: Response): Promise<Response> {
    return this.decidir(req, res, 'reject');
  }

  private async decidir(req: Request, res: Response, accion: 'accept' | 'reject'): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const userId = Number((req as any).user?.id);

      const result =
        accion === 'accept'
          ? await this.app.acceptRoutine(id, userId)
          : await this.app.rejectRoutine(id, userId);

      switch (result) {
        case 'not_found':
          return res.status(404).json({ message: 'Rutina no encontrada' });
        case 'forbidden':
          return res.status(403).json({ message: 'Solo el usuario asignado puede decidir sobre esta rutina' });
        case 'already':
          return res.status(409).json({ message: 'La rutina ya fue aceptada o rechazada' });
        default:
          return res.status(200).json({
            message: accion === 'accept' ? 'Rutina aceptada' : 'Rutina rechazada',
          });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteRoutine(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const deleted = await this.app.deleteRoutine(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Rutina no encontrada' });
      }
      return res.status(200).json({ message: 'Rutina dada de baja' });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
