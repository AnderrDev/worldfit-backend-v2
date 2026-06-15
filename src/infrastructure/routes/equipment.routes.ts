import { Router } from 'express';
import { EquipmentAdapter } from '../adapter/equipment.adapter';
import { EquipmentApplication } from '../../application/equipment.application';
import { EquipmentController } from '../controller/equipment.controller';
import { authenticateToken, requireAdmin } from '../web/auth.middleware';

const router = Router();

// Cadena de inyeccion de dependencias: adapter -> application -> controller
const equipmentAdapter = new EquipmentAdapter();
const equipmentApplication = new EquipmentApplication(equipmentAdapter);
const equipmentController = new EquipmentController(equipmentApplication);

// Consultas: cualquier usuario autenticado (JWT).
router.get('/equipment', authenticateToken, (req, res) => equipmentController.getAllEquipment(req, res));
router.get('/equipment/:id', authenticateToken, (req, res) => equipmentController.getEquipmentById(req, res));

// Gestion (crear/editar/eliminar): solo administradores.
router.post('/equipment', authenticateToken, requireAdmin, (req, res) => equipmentController.createEquipment(req, res));
router.put('/equipment/:id', authenticateToken, requireAdmin, (req, res) => equipmentController.updateEquipment(req, res));
router.delete('/equipment/:id', authenticateToken, requireAdmin, (req, res) => equipmentController.deleteEquipment(req, res));

export default router;
