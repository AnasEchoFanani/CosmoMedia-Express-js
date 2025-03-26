import { z } from 'zod';

// Base environment schema that all services will extend
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number).pipe(z.number().positive()),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // CORS
  CORS_ORIGIN: z.string().url().or(z.literal('*')).default('*'),
  
  // Cache
  CACHE_ENABLED: z.string().transform(val => val === 'true').default('true'),
  CACHE_DURATION: z.string().transform(Number).pipe(z.number().positive()).default('300000')
});

// Helper function to validate environment with a specific schema
export const validateEnv = (schema) => {
  try {
    return schema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
};
