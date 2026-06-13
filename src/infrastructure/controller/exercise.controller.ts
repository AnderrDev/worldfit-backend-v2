import { Request, Response } from 'express';
import { ExerciseApplication } from '../../application/exercise.application';
import { validateExerciseData } from '../util/exercise-validation';
import { validateExerciseUpdate } from '../util/exercise-update-validation';

export class ExerciseController {
  private app: ExerciseApplication;

  constructor(app: ExerciseApplication) {
    this.app = app;
  }

  async createExercise(req: Request, res: Response): Promise<Response> {
    try {
      const { error, value } = validateExerciseData(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const exerciseId = await this.app.createExercise(value as any);
      return res.status(201).json({ message: 'Ejercicio creado con exito', exerciseId });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getAllExercises(_req: Request, res: Response): Promise<Response> {
    try {
      const exercises = await this.app.getAllExercises();
      return res.status(200).json(exercises);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getExerciseById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const exercise = await this.app.getExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }
      return res.status(200).json(exercise);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async updateExercise(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const { error, value } = validateExerciseUpdate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const updated = await this.app.updateExercise(id, value as any);
      if (!updated) {
        return res.status(404).json({ message: 'Ejercicio no encontrado o sin cambios' });
      }
      return res.status(200).json({ message: 'Ejercicio actualizado correctamente' });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteExercise(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const deleted = await this.app.deleteExercise(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Ejercicio no encontrado' });
      }
      return res.status(200).json({ message: 'Ejercicio dado de baja' });
    } catch (error) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
