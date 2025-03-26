import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';
import Project from './Project.js';

const Task = sequelize.define('Task', {
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
    type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'TODO'
  },
  deadline: {
    type: DataTypes.DATE
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  assignedEmployeeUsername: {
    type: DataTypes.STRING
  },
  projectId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Project,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'tasks'
});

// Define relationships
Project.hasMany(Task);
Task.belongsTo(Project);

export default Task;
