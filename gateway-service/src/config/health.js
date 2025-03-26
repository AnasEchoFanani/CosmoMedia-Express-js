import env from '../../../shared/config/env.js';

export const healthConfig = {
  serviceName: 'gateway-service',
  dependencies: [
    {
      name: 'employee-service',
      url: env.EMPLOYEE_SERVICE_URL
    },
    {
      name: 'client-project-service',
      url: env.CLIENT_PROJECT_SERVICE_URL
    },
    {
      name: 'billing-service',
      url: env.BILLING_SERVICE_URL
    },
    {
      name: 'service-catalog',
      url: env.SERVICE_CATALOG_URL
    }
  ],
  redisUrl: env.REDIS_URL,
  dbConfig: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    dialect: 'mysql',
    logging: false
  }
};
