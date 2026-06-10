import { Router } from 'express';
import { RoutineAdapter } from '../adapter/routine.adapter';
import { UserAdapter } from '../adapter/user.adapter';
import { ExerciseAdapter } from '../adapter/exercise.adapter';
import { RoutineApplication } from '../../application/routine.application';
import { RoutineController } from '../controller/routine.controller';
import { authenticateToken, requireAdmin } from '../web/auth.middleware';

const router = Router();

// Cadena de inyeccion de dependencias: adapter -> application -> controller.
// RoutineApplication recibe ademas los puertos de usuarios y ejercicios
// (reglas de asignacion y validacion de ejercicios).
const routineAdapter = new RoutineAdapter();
const userAdapter = new UserAdapter();
const exerciseAdapter = new ExerciseAdapter();
const routineApplication = new RoutineApplication(routineAdapter, userAdapter, exerciseAdapter);
const routineController = new RoutineController(routineApplication);

// Consultas: cualquier usuario autenticado (JWT).
router.get('/routines', authenticateToken, (req, res) => routineController.getAllRoutines(req, res));
router.get('/routines/:id', authenticateToken, (req, res) => routineController.getRoutineById(req, res));

// Gestion (crear/editar/eliminar): solo administradores.
router.post('/routines', authenticateToken, requireAdmin, (req, res) => routineController.createRoutine(req, res));
router.put('/routines/:id', authenticateToken, requireAdmin, (req, res) => routineController.updateRoutine(req, res));
router.delete('/routines/:id', authenticateToken, requireAdmin, (req, res) => routineController.deleteRoutine(req, res));

// Flujo de aprobacion: el usuario asignado acepta o rechaza su rutina (solo JWT).
router.patch('/routines/:id/accept', authenticateToken, (req, res) => routineController.acceptRoutine(req, res));
router.patch('/routines/:id/reject', authenticateToken, (req, res) => routineController.rejectRoutine(req, res));

export default router;
