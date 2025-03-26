import { DataTypes } from 'sequelize';
import sequelize from '../../../src/config/database.js';
import Employee from './Employee.js';

const Role = sequelize.define('Role', {
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
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  tableName: 'roles'
});

// Define relationships
Role.hasMany(Employee);
Employee.belongsTo(Role);

export default Role;
