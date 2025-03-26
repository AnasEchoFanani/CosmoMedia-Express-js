import express from 'express';
import { body } from 'express-validator';
import * as employeeController from '../controllers/employeeController.js';

const router = express.Router();

// Validation middleware
const validateEmployee = [
  body('username').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('position').notEmpty().trim()
];

// Routes with pagination
router.get('/', employeeController.getAllEmployees);
router.post('/', validateEmployee, employeeController.createEmployee);
router.get('/:id', employeeController.getEmployeeById);

export default router;
