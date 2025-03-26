import express from 'express';
import { body } from 'express-validator';
import * as clientController from '../controllers/clientController.js';
import * as projectController from '../controllers/projectController.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// Client validation middleware
const validateClient = [
  body('fullName').notEmpty().trim(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('address').notEmpty()
];

// Project validation middleware
const validateProject = [
  body('title').notEmpty().trim(),
  body('clientId').isInt(),
  body('status').isIn(['PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  body('clientBudget').optional().isDecimal()
];

// Task validation middleware
const validateTask = [
  body('title').notEmpty().trim(),
  body('projectId').isInt(),
  body('status').isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
];

// Client routes
router.get('/clients', clientController.getAllClients);
router.get('/clients/:id', clientController.getClientById);
router.post('/clients', validateClient, clientController.createClient);
router.put('/clients/:id', validateClient, clientController.updateClient);
router.delete('/clients/:id', clientController.deleteClient);

// Project routes
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', validateProject, projectController.createProject);
router.put('/projects/:id', validateProject, projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Task routes
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.post('/tasks', validateTask, taskController.createTask);
router.put('/tasks/:id', validateTask, taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

export default router;
