import pino from 'pino';
import env from '../../config/env.js';
import { logConfig } from './config.js';

// Create the base logger instance
const logger = pino({
  ...logConfig[env.NODE_ENV],
  base: {
    env: env.NODE_ENV,
    version: process.env.npm_package_version
  },
  mixin() {
    return {
      service: process.env.SERVICE_NAME,
      timestamp: new Date().toISOString()
    };
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.creditCard',
      'user.password'
    ],
    censor: '**REDACTED**'
  }
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    query: req.query,
    params: req.params,
    headers: req.headers,
    body: req.body,
    ip: req.ip
  }, 'Incoming request');

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length')
    }, 'Request completed');
  });

  next();
};

// Error logging
export const errorLogger = (err, req, res, next) => {
  const errorLog = {
    type: 'error',
    error: {
      message: err.message,
      code: err.errorCode,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: req.headers,
      body: req.body
    }
  };

  if (err.isOperational) {
    logger.warn(errorLog, 'Operational error occurred');
  } else {
    logger.error(errorLog, 'System error occurred');
  }

  next(err);
};

// Performance logging
export const performanceLogger = (label) => {
  const startTime = process.hrtime();
  
  return {
    end: (data = {}) => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds * 1000 + nanoseconds / 1e6;
      
      logger.info({
        type: 'performance',
        label,
        duration,
        ...data
      }, 'Performance measurement');
      
      return duration;
    }
  };
};

// Database query logging
export const queryLogger = (query, duration) => {
  logger.debug({
    type: 'database',
    query: query.sql,
    parameters: query.bindings,
    duration
  }, 'Database query executed');
};

// Audit logging
export const auditLogger = (action, userId, data) => {
  logger.info({
    type: 'audit',
    action,
    userId,
    data
  }, 'Audit log entry');
};

// Security logging
export const securityLogger = (event, data) => {
  logger.warn({
    type: 'security',
    event,
    ...data
  }, 'Security event detected');
};

export default logger;
