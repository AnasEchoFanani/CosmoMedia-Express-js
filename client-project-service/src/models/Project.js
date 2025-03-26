import { DataTypes } from 'sequelize';
import sequelize from '../../../src/config/database.js';
import Client from './Client.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  clientBudget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  clientId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'projects'
});

// Define relationships
Client.hasMany(Project);
Project.belongsTo(Client);

export default Project;
