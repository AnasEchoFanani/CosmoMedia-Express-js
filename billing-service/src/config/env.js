import { z } from 'zod';
import { baseEnvSchema, validateEnv } from '../../../shared/utils/validateEnv.js';

const billingEnvSchema = baseEnvSchema.extend({
  BILLING_SERVICE_PORT: z.string().transform(Number).pipe(z.number().positive()),
  
  // Billing-specific settings
  DEFAULT_CURRENCY: z.string().default('USD'),
  TAX_RATE: z.string().transform(Number).pipe(z.number().min(0).max(100)).default('0'),
  INVOICE_PREFIX: z.string().default('INV'),
  QUOTE_PREFIX: z.string().default('QUO'),
  
  // Payment gateway settings
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  
  // Email settings for invoices and receipts
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  
  // Integration URLs
  CLIENT_PROJECT_SERVICE_URL: z.string().url(),
  SERVICE_CATALOG_URL: z.string().url()
});

export default validateEnv(billingEnvSchema);
