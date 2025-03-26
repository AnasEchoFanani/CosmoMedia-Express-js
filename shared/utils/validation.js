import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    return {
      status: 400,
      message: error.errors.map(e => e.message)
    };
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return {
      status: 409,
      message: 'Resource already exists'
    };
  }
  return {
    status: 500,
    message: 'Internal server error'
  };
};
