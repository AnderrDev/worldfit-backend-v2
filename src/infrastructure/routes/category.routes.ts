import { Router } from 'express';
import { CategoryAdapter } from '../adapter/category.adapter';
import { CategoryApplication } from '../../application/category.application';
import { CategoryController } from '../controller/category.controller';
import { authenticateToken, requireAdmin } from '../web/auth.middleware';

const router = Router();

// Cadena de inyeccion de dependencias: adapter -> application -> controller
const categoryAdapter = new CategoryAdapter();
const categoryApplication = new CategoryApplication(categoryAdapter);
const categoryController = new CategoryController(categoryApplication);

// Consultas: cualquier usuario autenticado (JWT).
router.get('/categories', authenticateToken, (req, res) => categoryController.getAllCategories(req, res));
router.get('/categories/:id', authenticateToken, (req, res) => categoryController.getCategoryById(req, res));

// Gestion (crear/editar/eliminar): solo administradores.
router.post('/categories', authenticateToken, requireAdmin, (req, res) => categoryController.createCategory(req, res));
router.put('/categories/:id', authenticateToken, requireAdmin, (req, res) => categoryController.updateCategory(req, res));
router.delete('/categories/:id', authenticateToken, requireAdmin, (req, res) => categoryController.deleteCategory(req, res));

export default router;
