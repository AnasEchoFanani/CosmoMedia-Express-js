import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterIssuedAt(value) {
        if (value <= this.issuedAt) {
          throw new Error('Due date must be after issued date');
        }
      }
    }
  },
  clientId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'invoices',
  hooks: {
    beforeValidate: (invoice) => {
      // Generate reference number if not provided
      if (!invoice.reference) {
        const date = new Date();
        invoice.reference = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }
    }
  }
});

export default Invoice;
