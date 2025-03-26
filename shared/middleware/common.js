import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

export const setupCommonMiddleware = (app) => {
  // Security middleware
  app.use(cors());
  app.use(helmet());
  
  // Performance middleware
  app.use(compression());
  
  // Body parsing
  app.use(express.json());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  });
  app.use(limiter);
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
