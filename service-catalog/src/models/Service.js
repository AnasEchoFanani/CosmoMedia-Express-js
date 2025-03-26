import { DataTypes } from 'sequelize';
import sequelize from '../../../src/config/database.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
    type: DataTypes.ENUM('WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'UI_UX_DESIGN', 'CLOUD_SERVICES', 'CONSULTING', 'MAINTENANCE'),
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
      // Ensure features is an array
      if (!Array.isArray(service.features)) {
        service.features = [];
      }
      // Ensure customizationOptions is an array
      if (!Array.isArray(service.customizationOptions)) {
        service.customizationOptions = [];
      }
      // Ensure technologiesUsed is an array
      if (!Array.isArray(service.technologiesUsed)) {
        service.technologiesUsed = [];
      }
    }
  }
});

// Create ServiceBundle model for package deals
const ServiceBundle = sequelize.define('ServiceBundle', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'service_bundles'
});

// Junction table for many-to-many relationship between Service and ServiceBundle
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

// Define relationships
Service.belongsToMany(ServiceBundle, { through: BundleServices });
ServiceBundle.belongsToMany(Service, { through: BundleServices });

export { Service as default, ServiceBundle, BundleServices };
