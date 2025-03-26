import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';
import { Service } from './Service.js';

const ServiceBundle = sequelize.define('ServiceBundle', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  discountPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'service_bundles'
});

// Define relationships
ServiceBundle.belongsToMany(Service, {
  through: 'ServiceBundleServices',
  foreignKey: 'serviceBundleId',
  otherKey: 'serviceId'
});

Service.belongsToMany(ServiceBundle, {
  through: 'ServiceBundleServices',
  foreignKey: 'serviceId',
  otherKey: 'serviceBundleId'
});

export default ServiceBundle;
