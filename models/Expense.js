// In-memory expense storage
let expenses = [];
let nextId = 1;

class Expense {
  constructor(userId, amount, category, date, description) {
    this.id = nextId++;
    this.userId = userId;
    this.amount = parseFloat(amount);
    this.category = category;
    this.date = date ? new Date(date) : new Date();
    this.description = description.trim();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Save expense to in-memory storage
  save() {
    expenses.push(this);
    return this;
  }

  // Find expenses by user ID
  static findByUserId(userId) {
    return expenses.filter(expense => expense.userId === parseInt(userId));
  }

  // Find expense by ID
  static findById(id) {
    return expenses.find(expense => expense.id === parseInt(id));
  }

  // Find expense by ID and user ID
  static findByIdAndUserId(id, userId) {
    return expenses.find(expense => expense.id === parseInt(id) && expense.userId === parseInt(userId));
  }

  // Get all expenses
  static find() {
    return expenses;
  }

  // Delete expense by ID
  static deleteById(id) {
    const index = expenses.findIndex(expense => expense.id === parseInt(id));
    if (index !== -1) {
      expenses.splice(index, 1);
      return true;
    }
    return false;
  }

  // Update expense
  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date();
    return this;
  }
}

module.exports = Expense;
