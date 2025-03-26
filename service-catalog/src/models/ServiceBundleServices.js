import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';

const ServiceBundleServices = sequelize.define('ServiceBundleServices', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  serviceBundleId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'ServiceBundle',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Service',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  timestamps: true,
  tableName: 'service_bundle_services'
});

export default ServiceBundleServices;
