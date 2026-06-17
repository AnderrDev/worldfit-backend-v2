import { Request, Response } from 'express';
import { GoalApplication } from '../../application/goal.application';
import { validateGoalData } from '../util/goal-validation';
import { validateGoalUpdate } from '../util/goal-update-validation';
import { BusinessError } from '../../shared/business-error';

export class GoalController {
  private app: GoalApplication;

  constructor(app: GoalApplication) {
    this.app = app;
  }

  async createGoal(req: Request, res: Response): Promise<Response> {
    try {
      const { error, value } = validateGoalData(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const goalId = await this.app.createGoal(value);
      return res.status(201).json({ message: 'Objetivo creado con exito', goalId });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getAllGoals(_req: Request, res: Response): Promise<Response> {
    try {
      const goals = await this.app.getAllGoals();
      return res.status(200).json(goals);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getGoalById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const goal = await this.app.getGoalById(id);
      if (!goal) {
        return res.status(404).json({ message: 'Objetivo no encontrado' });
      }
      return res.status(200).json(goal);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async updateGoal(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const { error, value } = validateGoalUpdate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      await this.app.updateGoal(id, value);
      return res.status(200).json({ message: 'Objetivo actualizado correctamente' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteGoal(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      await this.app.deleteGoal(id);
      return res.status(200).json({ message: 'Objetivo dado de baja' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
