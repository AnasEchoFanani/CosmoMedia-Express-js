import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import env from '../../shared/config/env.js';
import logger from '../../shared/utils/logger/index.js';
import { HealthCheck } from '../../shared/utils/health.js';
import employeeRoutes from './routes/employeeRoutes.js';
import sequelize from '../../shared/config/database.js';

const app = express();

// Health Check
const health = new HealthCheck({
  serviceName: 'employee-service',
  dbConfig: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Health check endpoints
app.get('/live', async (req, res) => {
  const status = await health.getLivenessStatus();
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});

app.get('/ready', async (req, res) => {
  const status = await health.getReadinessStatus();
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});

app.get('/health', async (req, res) => {
  const status = await health.getFullStatus();
  res.status(status.status === 'healthy' ? 200 : 503).json(status);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS
});
app.use(limiter);

// Routes
app.use('/api/employees', employeeRoutes);

// Database connection
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized.');
  } catch (error) {
    logger.error({ error }, 'Unable to connect to the database');
    process.exit(1);
  }
};

initDatabase();

const PORT = env.EMPLOYEE_SERVICE_PORT;
app.listen(PORT, () => {
  logger.info(`Employee service running on port ${PORT}`);
});

export default app;
