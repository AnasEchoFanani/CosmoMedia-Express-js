import { validationResult } from 'express-validator';
import Quote from '../models/Quote.js';
import Invoice from '../models/Invoice.js';

export const getAllQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const clientId = req.query.clientId;

    const queryOptions = {
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where: {}
    };

    if (status) {
      queryOptions.where.status = status;
    }

    if (clientId) {
      queryOptions.where.clientId = clientId;
    }

    const { count, rows } = await Quote.findAndCountAll(queryOptions);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      quotes: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quote = await Quote.create(req.body);
    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Don't allow updates to accepted/rejected quotes
    if (['ACCEPTED', 'REJECTED'].includes(quote.status)) {
      return res.status(400).json({ 
        message: 'Cannot update accepted or rejected quotes' 
      });
    }

    await quote.update(req.body);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptQuote = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    if (quote.status !== 'SENT') {
      return res.status(400).json({ 
        message: 'Only sent quotes can be accepted' 
      });
    }

    // Create invoice from quote
    const invoice = await Invoice.create({
      clientId: quote.clientId,
      amount: quote.estimatedAmount,
      subtotal: quote.estimatedAmount,
      tax: 0,
      status: 'DRAFT',
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: `Generated from Quote ${quote.reference}\n\n${quote.projectScope}`
    });

    // Update quote status
    await quote.update({ status: 'ACCEPTED' });

    res.json({ 
      message: 'Quote accepted and invoice created',
      quote,
      invoice 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectQuote = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    if (quote.status !== 'SENT') {
      return res.status(400).json({ 
        message: 'Only sent quotes can be rejected' 
      });
    }

    await quote.update({ 
      status: 'REJECTED',
      notes: req.body.rejectionReason 
        ? `${quote.notes}\n\nRejection Reason: ${req.body.rejectionReason}`
        : quote.notes
    });

    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Only allow deletion of draft quotes
    if (quote.status !== 'DRAFT') {
      return res.status(400).json({ 
        message: 'Only draft quotes can be deleted' 
      });
    }

    await quote.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
