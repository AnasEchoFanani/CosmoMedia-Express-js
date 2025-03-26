import { errorHandler } from '../utils/errors.js';
import env from '../config/env.js';

export const setupErrorHandling = (app) => {
  // Handle 404 errors
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.statusCode = 404;
    err.errorCode = 'NOT_FOUND';
    next(err);
  });

  // Global error handler
  app.use(errorHandler);

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.info('👋 SIGTERM received. Performing graceful shutdown...');
    // Close server gracefully
    if (app.server) {
      app.server.close(() => {
        console.info('🔄 Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

// Rate limit error handler
export const handleRateLimitError = (req, res) => {
  res.status(429).json({
    status: 'error',
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  });
};

// Validation middleware
export const validationErrorHandler = (err, req, res, next) => {
  if (err.status === 400 && err.errors) {
    return res.status(400).json({
      status: 'fail',
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: err.errors
      }
    });
  }
  next(err);
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Only set strict headers in production
  if (env.NODE_ENV === 'production') {
    res.set({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'"
    });
  }
  next();
};
