import express from 'express';
import { body } from 'express-validator';
import * as invoiceController from '../controllers/invoiceController.js';
import * as quoteController from '../controllers/quoteController.js';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

// Invoice validation middleware
const validateInvoice = [
  body('clientId').isInt(),
  body('amount').isDecimal({ min: 0 }),
  body('subtotal').isDecimal({ min: 0 }),
  body('tax').isDecimal({ min: 0 }),
  body('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
  body('dueDate').isISO8601()
];

// Quote validation middleware
const validateQuote = [
  body('clientId').isInt(),
  body('estimatedAmount').isDecimal({ min: 0 }),
  body('status').optional().isIn(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
  body('validUntil').isISO8601(),
  body('projectScope').notEmpty()
];

// Transaction validation middleware
const validateTransaction = [
  body('invoiceId').isInt(),
  body('amount').isDecimal({ min: 0 }),
  body('type').isIn(['PAYMENT', 'REFUND', 'CREDIT', 'DEBIT']),
  body('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'])
];

// Invoice routes
router.get('/invoices', invoiceController.getAllInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.post('/invoices', validateInvoice, invoiceController.createInvoice);
router.put('/invoices/:id', validateInvoice, invoiceController.updateInvoice);
router.delete('/invoices/:id', invoiceController.deleteInvoice);

// Quote routes
router.get('/quotes', quoteController.getAllQuotes);
router.get('/quotes/:id', quoteController.getQuoteById);
router.post('/quotes', validateQuote, quoteController.createQuote);
router.put('/quotes/:id', validateQuote, quoteController.updateQuote);
router.delete('/quotes/:id', quoteController.deleteQuote);
router.post('/quotes/:id/accept', quoteController.acceptQuote);
router.post('/quotes/:id/reject', quoteController.rejectQuote);

// Transaction routes
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);
router.post('/transactions', validateTransaction, transactionController.createTransaction);
router.put('/transactions/:id', validateTransaction, transactionController.updateTransaction);
router.post('/transactions/:id/refund', transactionController.processRefund);

export default router;
