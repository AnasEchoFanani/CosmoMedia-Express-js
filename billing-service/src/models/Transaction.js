import { DataTypes } from 'sequelize';
import sequelize from '../../../shared/config/database.js';
import Invoice from './Invoice.js';

const Transaction = sequelize.define('Transaction', {
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
  type: {
    type: DataTypes.ENUM('PAYMENT', 'REFUND', 'CREDIT', 'DEBIT'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  paymentDetails: {
    type: DataTypes.JSON
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  invoiceId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'transactions',
  hooks: {
    beforeValidate: (transaction) => {
      // Generate reference number if not provided
      if (!transaction.reference) {
        const date = new Date();
        transaction.reference = `TRX-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }
    },
    afterCreate: async (transaction) => {
      // Update invoice status if payment is completed
      if (transaction.status === 'COMPLETED' && transaction.type === 'PAYMENT') {
        const invoice = await Invoice.findByPk(transaction.invoiceId);
        if (invoice) {
          const totalPaid = await Transaction.sum('amount', {
            where: {
              invoiceId: transaction.invoiceId,
              status: 'COMPLETED',
              type: 'PAYMENT'
            }
          });
          
          if (totalPaid >= invoice.amount) {
            await invoice.update({ status: 'PAID' });
          }
        }
      }
    }
  }
});

// Define relationships
Invoice.hasMany(Transaction, {
  foreignKey: 'invoiceId'
});
Transaction.belongsTo(Invoice, {
  foreignKey: 'invoiceId'
});

export default Transaction;
