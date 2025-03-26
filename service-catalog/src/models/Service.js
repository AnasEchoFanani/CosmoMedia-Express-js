import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';

const Service = sequelize.define('Service', {
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
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  category: {
    type: DataTypes.ENUM(
      'WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'UI_UX_DESIGN', 'CLOUD_SERVICES', 'CONSULTING', 'MAINTENANCE'
    ),
    allowNull: false
  },
  features: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  deliveryTimeframe: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  customizationOptions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  technologiesUsed: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  maintenanceIncluded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  maintenanceDuration: {
    type: DataTypes.INTEGER, // in months
    defaultValue: 0
  },
  seoOptimization: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  projectId: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'services',
  hooks: {
    beforeValidate: (service) => {
      service.features = Array.isArray(service.features) ? service.features : [];
      service.customizationOptions = Array.isArray(service.customizationOptions) ? service.customizationOptions : [];
      service.technologiesUsed = Array.isArray(service.technologiesUsed) ? service.technologiesUsed : [];
    }
  }
});

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

const BundleServices = sequelize.define('BundleServices', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  timestamps: false,
  tableName: 'bundle_services'
});

// Define many-to-many relationships
Service.belongsToMany(ServiceBundle, { through: BundleServices, foreignKey: 'serviceId' });
ServiceBundle.belongsToMany(Service, { through: BundleServices, foreignKey: 'bundleId' });

export { Service, ServiceBundle, BundleServices };