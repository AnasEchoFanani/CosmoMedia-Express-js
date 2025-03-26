import { body, param, query } from 'express-validator';

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

export const idValidator = [
  param('id').isInt({ min: 1 })
];

export const dateValidator = [
  body('date').optional().isISO8601().toDate()
];

export const statusValidator = (validStatuses) => [
  body('status').isIn(validStatuses)
];

export const priceValidator = [
  body('price').isDecimal({ decimal_digits: '0,2', min: 0 })
];

export const emailValidator = [
  body('email').isEmail().normalizeEmail()
];

export const passwordValidator = [
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
];
