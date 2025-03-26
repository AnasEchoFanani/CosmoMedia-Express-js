import { DataTypes } from 'sequelize';
import sequelize from '../../../src/config/database.js';
import Service from './Service.js';

const ServiceReview = sequelize.define('ServiceReview', {
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
  clientId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  projectId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  sentiment: {
    type: DataTypes.ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE'),
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responseDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'service_reviews'
});

// Define relationships
Service.hasMany(ServiceReview);
ServiceReview.belongsTo(Service);

export default ServiceReview;
