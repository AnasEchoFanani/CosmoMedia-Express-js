import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import sequelize from '../../shared/config/database.js';

// Import models to ensure they are registered with Sequelize
import './models/Service.js';

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

// Cache configuration for frequently accessed data
const serviceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache middleware for services
app.use('/api/services', (req, res, next) => {
  if (req.method === 'GET') {
    const cacheKey = req.originalUrl;
    const cachedData = serviceCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
      return res.json(cachedData.data);
    }
    
    // Store the original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data) {
      serviceCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return originalJson.call(this, data);
    };
  }
  next();
});

// Clear cache when services are modified
const clearServiceCache = () => {
  serviceCache.clear();
};

app.use('/api/services', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    clearServiceCache();
  }
  next();
});

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

    // Create default service categories if they don't exist
    const Service = sequelize.models.Service;
    const categories = [
      'WEB_DEVELOPMENT',
      'MOBILE_DEVELOPMENT',
      'UI_UX_DESIGN',
      'CLOUD_SERVICES',
      'CONSULTING',
      'MAINTENANCE'
    ];

    // Seed some example services if none exist
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      const exampleServices = [
        {
          name: 'Custom Web Development',
          description: 'Full-stack web application development with modern technologies',
          price: 5000.00,
          category: 'WEB_DEVELOPMENT',
          features: ['Responsive Design', 'API Integration', 'Database Design'],
          deliveryTimeframe: '6-8 weeks',
          technologiesUsed: ['React', 'Node.js', 'PostgreSQL'],
          maintenanceIncluded: true,
          maintenanceDuration: 3,
          seoOptimization: true
        },
        {
          name: 'Mobile App Development',
          description: 'Native mobile application development for iOS and Android',
          price: 8000.00,
          category: 'MOBILE_DEVELOPMENT',
          features: ['Cross-platform', 'Offline Support', 'Push Notifications'],
          deliveryTimeframe: '8-12 weeks',
          technologiesUsed: ['React Native', 'Firebase'],
          maintenanceIncluded: true,
          maintenanceDuration: 6
        }
      ];

      await Service.bulkCreate(exampleServices);
      console.log('Example services created.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Initialize database and start server
const PORT = process.env.SERVICE_CATALOG_PORT || 3004;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Service catalog running on port ${PORT}`);
  });
});

export default app;
