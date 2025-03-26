import { z } from 'zod';
import { baseEnvSchema, validateEnv } from '../../../shared/utils/validateEnv.js';

const serviceCatalogEnvSchema = baseEnvSchema.extend({
  SERVICE_CATALOG_PORT: z.string().transform(Number).pipe(z.number().positive()),
  
  // Catalog-specific settings
  MAX_SERVICES_PER_PAGE: z.string().transform(Number).pipe(z.number().positive()).default('20'),
  ENABLE_SERVICE_REVIEWS: z.string().transform(val => val === 'true').default('true'),
  MIN_REVIEW_LENGTH: z.string().transform(Number).pipe(z.number().positive()).default('10'),
  MAX_REVIEW_LENGTH: z.string().transform(Number).pipe(z.number().positive()).default('1000'),
  
  // Image storage settings
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Integration URLs
  BILLING_SERVICE_URL: z.string().url()
});

export default validateEnv(serviceCatalogEnvSchema);
