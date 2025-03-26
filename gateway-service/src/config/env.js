import { z } from 'zod';
import { baseEnvSchema, validateEnv } from '../../../shared/utils/validateEnv.js';

const gatewayEnvSchema = baseEnvSchema.extend({
  GATEWAY_PORT: z.string().transform(Number).pipe(z.number().positive()),
  
  // Service URLs
  EMPLOYEE_SERVICE_URL: z.string().url(),
  CLIENT_PROJECT_SERVICE_URL: z.string().url(),
  BILLING_SERVICE_URL: z.string().url(),
  SERVICE_CATALOG_URL: z.string().url(),
  
  // Additional Gateway-specific settings
  PROXY_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('30000'),
  MAX_PAYLOAD_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('10485760') // 10MB
});

export default validateEnv(gatewayEnvSchema);
