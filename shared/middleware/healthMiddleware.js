import { Router } from 'express';
import { HealthCheck } from '../utils/health.js';
import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

// Rate limiter for health endpoints
const healthRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many health check requests'
});

export const setupHealthChecks = (app, config) => {
  const router = Router();
  const health = new HealthCheck(config);

  // Basic liveness probe
  router.get('/live', async (req, res) => {
    const status = await health.getLivenessStatus();
    res.status(status.status === 'healthy' ? 200 : 503).json(status);
  });

  // Readiness probe
  router.get('/ready', async (req, res) => {
    const status = await health.getReadinessStatus();
    res.status(status.status === 'healthy' ? 200 : 503).json(status);
  });

  // Detailed health status (with rate limiting)
  router.get('/health', 
    env.NODE_ENV === 'production' ? healthRateLimit : (req, res, next) => next(),
    async (req, res) => {
      const status = await health.getFullStatus();
      res.status(status.status === 'healthy' ? 200 : 503).json(status);
    }
  );

  // Mount health check routes
  app.use('/', router);
};

// Middleware to check service health before processing requests
export const healthCheckMiddleware = (config) => {
  const health = new HealthCheck(config);
  
  return async (req, res, next) => {
    const status = await health.getReadinessStatus();
    if (status.status !== 'healthy') {
      return res.status(503).json({
        status: 'error',
        message: 'Service is not ready to handle requests',
        details: status
      });
    }
    next();
  };
};
