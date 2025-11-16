const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    let expenses = Expense.findByUserId(req.user.id);

    if (category) {
      expenses = expenses.filter(exp => exp.category === category);
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      expenses = expenses.filter(exp => exp.date >= start && exp.date <= end);
    }

    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedExpenses = expenses.slice(startIndex, endIndex);

    res.json({
      expenses: paginatedExpenses,
      totalPages: Math.ceil(expenses.length / limit),
      currentPage: parseInt(page),
      totalExpenses: expenses.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = Expense.findByIdAndUserId(req.params.id, req.user.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, date, description } = req.body;
    const expense = new Expense(req.user.id, amount, category, date, description);
    expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, date, description } = req.body;
    const expense = Expense.findByIdAndUserId(req.params.id, req.user.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.update({ amount: parseFloat(amount), category, date: new Date(date), description });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = Expense.findByIdAndUserId(req.params.id, req.user.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    Expense.deleteById(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let expenses = Expense.findByUserId(req.user.id);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      expenses = expenses.filter(exp => exp.date >= start && exp.date <= end);
    }

    const categoryMap = {};
    let totalAmount = 0;

    expenses.forEach(exp => {
      totalAmount += exp.amount;
      if (categoryMap[exp.category]) {
        categoryMap[exp.category].total += exp.amount;
        categoryMap[exp.category].count += 1;
      } else {
        categoryMap[exp.category] = { total: exp.amount, count: 1 };
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      _id: category,
      total: data.total,
      count: data.count,
    })).sort((a, b) => b.total - a.total);

    res.json({
      totalAmount,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const expenses = Expense.findByUserId(req.user.id);

    const monthlyMap = {};
    expenses.forEach(exp => {
      const expYear = exp.date.getFullYear();
      const expMonth = exp.date.getMonth() + 1; // getMonth() returns 0-11
      if (expYear === parseInt(year)) {
        const key = expMonth;
        if (monthlyMap[key]) {
          monthlyMap[key].total += exp.amount;
          monthlyMap[key].count += 1;
        } else {
          monthlyMap[key] = { total: exp.amount, count: 1 };
        }
      }
    });

    const trends = Object.entries(monthlyMap).map(([month, data]) => ({
      _id: parseInt(month),
      total: data.total,
      count: data.count,
    })).sort((a, b) => a._id - b._id);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getMonthlyTrends,
};
