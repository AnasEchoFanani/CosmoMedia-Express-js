import env from '../config/env.js';

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Different error responses based on environment
  if (env.NODE_ENV === 'development') {
    return sendDevError(err, res);
  }
  
  if (env.NODE_ENV === 'test') {
    return sendTestError(err, res);
  }
  
  return sendProdError(err, res);
};

const sendDevError = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: {
      message: err.message,
      code: err.errorCode,
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    }
  });
};

const sendTestError = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: {
      message: err.message,
      code: err.errorCode,
      ...(err.errors && { errors: err.errors })
    }
  });
};

const sendProdError = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: {
        message: err.message,
        code: err.errorCode,
        ...(err.errors && { errors: err.errors })
      }
    });
  }
  
  // Programming or unknown error: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    error: {
      message: 'Something went wrong',
      code: 'INTERNAL_ERROR'
    }
  });
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Database error handler
export const handleDBError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    throw new ValidationError('Validation failed', errors);
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'field';
    throw new ConflictError(`${field} already exists`);
  }
  
  throw error;
};
