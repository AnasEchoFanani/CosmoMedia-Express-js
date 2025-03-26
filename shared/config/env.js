import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../..');

// Load environment-specific .env file
const environment = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.join(ROOT_DIR, `.env.${environment}`),
});

// Fall back to default .env if environment-specific one doesn't exist
dotenv.config({
  path: path.join(ROOT_DIR, '.env'),
});

// Environment variable validation schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database configuration
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().transform(Number).pipe(z.number().positive()),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  
  // Service ports
  GATEWAY_PORT: z.string().transform(Number).pipe(z.number().positive()),
  EMPLOYEE_SERVICE_PORT: z.string().transform(Number).pipe(z.number().positive()),
  CLIENT_PROJECT_SERVICE_PORT: z.string().transform(Number).pipe(z.number().positive()),
  BILLING_SERVICE_PORT: z.string().transform(Number).pipe(z.number().positive()),
  SERVICE_CATALOG_PORT: z.string().transform(Number).pipe(z.number().positive()),
  
  // JWT configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // CORS
  CORS_ORIGIN: z.string().url().or(z.literal('*')).default('*'),
  
  // Cache
  CACHE_ENABLED: z.string().transform(val => val === 'true').default('true'),
  CACHE_DURATION: z.string().transform(Number).pipe(z.number().positive()).default('300000'),
  
  // Service URLs (for inter-service communication)
  EMPLOYEE_SERVICE_URL: z.string().url(),
  CLIENT_PROJECT_SERVICE_URL: z.string().url(),
  BILLING_SERVICE_URL: z.string().url(),
  SERVICE_CATALOG_URL: z.string().url(),
  
  // Optional email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Optional S3 configuration for file storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional()
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
};

const env = validateEnv();

export default env;
