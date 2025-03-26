import { validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Invoice from '../models/Invoice.js';

export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const invoiceId = req.query.invoiceId;
    const type = req.query.type;

    const queryOptions = {
      limit,
      offset,
      include: [{ model: Invoice, attributes: ['reference', 'status'] }],
      order: [['createdAt', 'DESC']],
      where: {}
    };

    if (status) {
      queryOptions.where.status = status;
    }

    if (invoiceId) {
      queryOptions.where.invoiceId = invoiceId;
    }

    if (type) {
      queryOptions.where.type = type;
    }

    const { count, rows } = await Transaction.findAndCountAll(queryOptions);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      transactions: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: Invoice, attributes: ['reference', 'status'] }]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify invoice exists and can accept payments
    const invoice = await Invoice.findByPk(req.body.invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot process payment for cancelled invoice' });
    }

    if (invoice.status === 'PAID' && req.body.type === 'PAYMENT') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Don't allow updates to completed transactions
    if (transaction.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot update completed transactions' });
    }

    await transaction.update(req.body);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processRefund = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: Invoice }]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.type !== 'PAYMENT' || transaction.status !== 'COMPLETED') {
      return res.status(400).json({ 
        message: 'Can only refund completed payments' 
      });
    }

    // Create refund transaction
    const refund = await Transaction.create({
      type: 'REFUND',
      amount: transaction.amount,
      status: 'COMPLETED',
      invoiceId: transaction.invoiceId,
      paymentMethod: transaction.paymentMethod,
      paymentDetails: {
        originalTransactionId: transaction.id,
        reason: req.body.reason
      },
      notes: `Refund for transaction ${transaction.reference}\nReason: ${req.body.reason}`
    });

    // Update invoice status
    await transaction.Invoice.update({ status: 'CANCELLED' });

    res.json({
      message: 'Refund processed successfully',
      refund
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
