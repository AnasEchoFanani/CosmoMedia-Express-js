import { errorHandler } from '../../../shared/middleware/errorMiddleware.js';
import { AppError } from '../../../shared/utils/errors.js';
import logger, { logError } from '../../../shared/utils/logger.js';

// Gateway-specific error handler
export const gatewayErrorHandler = (err, req, res, next) => {
  // Handle proxy errors
  if (err.code === 'ECONNREFUSED') {
    const serviceError = new AppError(
      'Service is currently unavailable',
      503,
      'SERVICE_UNAVAILABLE'
    );
    logError(serviceError, {
      service: req.originalUrl.split('/')[1],
      targetUrl: err.address
    });
    return next(serviceError);
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT') {
    const timeoutError = new AppError(
      'Service request timed out',
      504,
      'GATEWAY_TIMEOUT'
    );
    logError(timeoutError, {
      service: req.originalUrl.split('/')[1],
      timeout: req.timeout
    });
    return next(timeoutError);
  }

  // Log any other errors
  logError(err, {
    path: req.path,
    method: req.method
  });

  // Pass to default error handler
  return errorHandler(err, req, res, next);
};

// Circuit breaker error handler
export const circuitBreakerErrorHandler = (err, req, res, next) => {
  if (err.code === 'CIRCUIT_OPEN') {
    const circuitError = new AppError(
      'Service is temporarily unavailable',
      503,
      'CIRCUIT_BREAKER_OPEN'
    );
    logError(circuitError, {
      service: req.originalUrl.split('/')[1],
      failureCount: err.failureCount
    });
    return next(circuitError);
  }
  next(err);
};
