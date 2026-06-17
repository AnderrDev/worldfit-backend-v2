import { Router } from 'express';
import { GoalAdapter } from '../adapter/goal.adapter';
import { GoalApplication } from '../../application/goal.application';
import { GoalController } from '../controller/goal.controller';
import { authenticateToken, requireAdmin } from '../web/auth.middleware';

const router = Router();

// Cadena de inyeccion de dependencias: adapter -> application -> controller
const goalAdapter = new GoalAdapter();
const goalApplication = new GoalApplication(goalAdapter);
const goalController = new GoalController(goalApplication);

// Consultas: cualquier usuario autenticado (JWT).
router.get('/goals', authenticateToken, (req, res) => goalController.getAllGoals(req, res));
router.get('/goals/:id', authenticateToken, (req, res) => goalController.getGoalById(req, res));

// Gestion (crear/editar/eliminar): solo administradores.
router.post('/goals', authenticateToken, requireAdmin, (req, res) => goalController.createGoal(req, res));
router.put('/goals/:id', authenticateToken, requireAdmin, (req, res) => goalController.updateGoal(req, res));
router.delete('/goals/:id', authenticateToken, requireAdmin, (req, res) => goalController.deleteGoal(req, res));

export default router;
