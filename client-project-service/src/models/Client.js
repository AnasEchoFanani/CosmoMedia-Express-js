import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyName: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  industry: {
    type: DataTypes.STRING
  },
  website: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'clients'
});

export default Client;
