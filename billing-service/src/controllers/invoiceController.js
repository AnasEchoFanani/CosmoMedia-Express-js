import { validationResult } from 'express-validator';
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';

export const getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const clientId = req.query.clientId;

    const queryOptions = {
      limit,
      offset,
      include: [{ model: Transaction }],
      order: [['createdAt', 'DESC']],
      where: {}
    };

    if (status) {
      queryOptions.where.status = status;
    }

    if (clientId) {
      queryOptions.where.clientId = clientId;
    }

    const { count, rows } = await Invoice.findAndCountAll(queryOptions);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      invoices: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [{ model: Transaction }]
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await Invoice.create(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Don't allow status update if invoice is already paid
    if (invoice.status === 'PAID' && req.body.status && req.body.status !== 'PAID') {
      return res.status(400).json({ message: 'Cannot update status of paid invoice' });
    }

    await invoice.update(req.body);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Only draft invoices can be deleted' });
    }

    await invoice.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
