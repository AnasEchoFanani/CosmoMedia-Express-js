import { z } from 'zod';
import { baseEnvSchema, validateEnv } from '../../../shared/utils/validateEnv.js';

const clientProjectEnvSchema = baseEnvSchema.extend({
  CLIENT_PROJECT_SERVICE_PORT: z.string().transform(Number).pipe(z.number().positive()),
  
  // Project-specific settings
  MAX_TASKS_PER_PROJECT: z.string().transform(Number).pipe(z.number().positive()).default('1000'),
  DEFAULT_PROJECT_STATUS: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']).default('PLANNING'),
  ENABLE_TASK_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),
  
  // AWS S3 for project files (optional)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Integration URLs
  EMPLOYEE_SERVICE_URL: z.string().url(),
  BILLING_SERVICE_URL: z.string().url()
});

export default validateEnv(clientProjectEnvSchema);
