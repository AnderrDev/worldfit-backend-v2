import { Router } from 'express';
import { ExerciseAdapter } from '../adapter/exercise.adapter';
import { ExerciseApplication } from '../../application/exercise.application';
import { ExerciseController } from '../controller/exercise.controller';
import { authenticateToken, requireAdmin } from '../web/auth.middleware';

const router = Router();

const exerciseAdapter = new ExerciseAdapter();
const exerciseApplication = new ExerciseApplication(exerciseAdapter);
const exerciseController = new ExerciseController(exerciseApplication);

router.get('/exercises/search', authenticateToken, (req, res) => exerciseController.getExercisesByMuscle(req, res));
router.get('/exercises', authenticateToken, (req, res) => exerciseController.getAllExercises(req, res));
router.get('/exercises/:id', authenticateToken, (req, res) => exerciseController.getExerciseById(req, res));

router.post('/exercises', authenticateToken, requireAdmin, (req, res) => exerciseController.createExercise(req, res));
router.put('/exercises/:id', authenticateToken, requireAdmin, (req, res) => exerciseController.updateExercise(req, res));
router.delete('/exercises/:id', authenticateToken, requireAdmin, (req, res) => exerciseController.deleteExercise(req, res));

export default router;
