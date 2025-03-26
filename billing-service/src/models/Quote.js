import { DataTypes } from 'sequelize';
import sequelize from '../../../src/config/database.js';

const Quote = sequelize.define('Quote', {
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
  estimatedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterCreatedAt(value) {
        if (value <= this.createdAt) {
          throw new Error('Valid until date must be after created date');
        }
      }
    }
  },
  clientId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  projectScope: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  terms: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'quotes',
  hooks: {
    beforeValidate: (quote) => {
      // Generate reference number if not provided
      if (!quote.reference) {
        const date = new Date();
        quote.reference = `QUO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }
    }
  }
});

export default Quote;
