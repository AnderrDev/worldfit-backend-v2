import { Router } from 'express';
import { UserAdapter } from '../adapter/user.adapter';
import { UserApplication } from '../../application/user.application';
import { UserController } from '../controller/user.controller';
import { authenticateToken } from '../web/auth.middleware';

const router = Router();

// Cadena de inyeccion de dependencias: adapter -> application -> controller
const userAdapter = new UserAdapter();
const userApplication = new UserApplication(userAdapter);
const userController = new UserController(userApplication);

// Rutas publicas
router.post('/users', (req, res) => userController.createUser(req, res));
router.post('/login', (req, res) => userController.login(req, res));

// Rutas protegidas con JWT
router.get('/users', authenticateToken, (req, res) => userController.getAllUsers(req, res));
router.get('/users/email/:email', authenticateToken, (req, res) => userController.getUserByEmail(req, res));
router.get('/users/:id', authenticateToken, (req, res) => userController.getUserById(req, res));
router.put('/users/:id', authenticateToken, (req, res) => userController.updateUser(req, res));
router.delete('/users/:id', authenticateToken, (req, res) => userController.deleteUser(req, res));

export default router;
