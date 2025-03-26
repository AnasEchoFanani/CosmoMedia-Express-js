import { DataTypes } from 'sequelize';
import sequelize from '../../../src/config/database.js';
import Service from './Service.js';

const ServiceAnalytics = sequelize.define('ServiceAnalytics', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  serviceId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Service,
      key: 'id'
    }
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  inquiryCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  conversionRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  completedProjects: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  averageCompletionTime: {
    type: DataTypes.INTEGER, // in days
    allowNull: true
  },
  revenue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  popularityScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'service_analytics'
});

// Define relationships
Service.hasOne(ServiceAnalytics);
ServiceAnalytics.belongsTo(Service);

export default ServiceAnalytics;
