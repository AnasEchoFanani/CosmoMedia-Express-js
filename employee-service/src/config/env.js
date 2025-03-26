import { z } from 'zod';
import { baseEnvSchema, validateEnv } from '../../../shared/utils/validateEnv.js';

const employeeEnvSchema = baseEnvSchema.extend({
  EMPLOYEE_SERVICE_PORT: z.string().transform(Number).pipe(z.number().positive()),
  
  // Employee-specific settings
  PASSWORD_SALT_ROUNDS: z.string().transform(Number).pipe(z.number().positive()).default('10'),
  SESSION_DURATION: z.string().transform(Number).pipe(z.number().positive()).default('3600'),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).pipe(z.number().positive()).default('5'),
  
  // Optional email settings for employee notifications
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional()
});

export default validateEnv(employeeEnvSchema);
