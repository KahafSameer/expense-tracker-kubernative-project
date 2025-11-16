const bcrypt = require('bcryptjs');

// In-memory user storage
let users = [];
let nextId = 1;

class User {
  constructor(username, email, password) {
    this.id = nextId++;
    this.username = username.trim();
    this.email = email.toLowerCase().trim();
    this.password = password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Hash password before saving
  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Compare password method
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Save user to in-memory storage
  save() {
    users.push(this);
    return this;
  }

  // Find user by email
  static findByEmail(email) {
    return users.find(user => user.email === email.toLowerCase().trim());
  }

  // Find user by username
  static findByUsername(username) {
    return users.find(user => user.username === username.trim());
  }

  // Find user by ID
  static findById(id) {
    return users.find(user => user.id === parseInt(id));
  }

  // Get all users
  static find() {
    return users;
  }
}

module.exports = User;
