import { Request, Response } from 'express';
import { CategoryApplication } from '../../application/category.application';
import { validateCategoryData } from '../util/category-validation';
import { validateCategoryUpdate } from '../util/category-update-validation';
import { BusinessError } from '../../shared/business-error';

export class CategoryController {
  private app: CategoryApplication;

  constructor(app: CategoryApplication) {
    this.app = app;
  }

  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { error, value } = validateCategoryData(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const categoryId = await this.app.createCategory(value);
      return res.status(201).json({ message: 'Categoria creada con exito', categoryId });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getAllCategories(_req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.app.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const category = await this.app.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const { error, value } = validateCategoryUpdate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      await this.app.updateCategory(id, value);
      return res.status(200).json({ message: 'Categoria actualizada correctamente' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      await this.app.deleteCategory(id);
      return res.status(200).json({ message: 'Categoria dada de baja' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
