import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import employeeRoutes from './routes/employeeRoutes.js';
import sequelize from '../../src/config/database.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/employees', employeeRoutes);

// Database connection
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

initDatabase();

const PORT = process.env.EMPLOYEE_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Employee service running on port ${PORT}`);
});

export default app;
