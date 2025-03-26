import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import sequelize from '../../shared/config/database.js';

// Import models to ensure they are registered with Sequelize
import './models/Invoice.js';
import './models/Quote.js';
import './models/Transaction.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// Routes
app.use('/api', routes);

// Scheduled tasks
const checkOverdueInvoices = async () => {
  try {
    const Invoice = sequelize.models.Invoice;
    const today = new Date();
    
    // Find all sent invoices that are past due
    const overdueInvoices = await Invoice.findAll({
      where: {
        status: 'SENT',
        dueDate: {
          [sequelize.Op.lt]: today
        }
      }
    });

    // Update their status to overdue
    for (const invoice of overdueInvoices) {
      await invoice.update({ status: 'OVERDUE' });
    }

    console.log(`Updated ${overdueInvoices.length} overdue invoices`);
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
};

// Run overdue check every day at midnight
setInterval(checkOverdueInvoices, 24 * 60 * 60 * 1000);
checkOverdueInvoices(); // Run immediately on startup

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database initialization
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Initialize database and start server
const PORT = process.env.BILLING_SERVICE_PORT || 3003;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Billing service running on port ${PORT}`);
  });
});

export default app;
