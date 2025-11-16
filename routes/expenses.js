const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getMonthlyTrends,
} = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all expense routes
router.use(authenticateToken);

// Validation rules
const expenseValidation = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Education', 'Other']).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
];

const dateQueryValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
];

// Routes
router.get('/', dateQueryValidation, getExpenses);
router.get('/stats', dateQueryValidation, getExpenseStats);
router.get('/trends', getMonthlyTrends);
router.get('/:id', idValidation, getExpense);
router.post('/', expenseValidation, createExpense);
router.put('/:id', [...idValidation, ...expenseValidation], updateExpense);
router.delete('/:id', idValidation, deleteExpense);

module.exports = router;
