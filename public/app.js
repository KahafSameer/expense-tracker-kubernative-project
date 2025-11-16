// API Base URL
const API_BASE = '/api';

// Utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        color: white;
        z-index: 1000;
        max-width: 300px;
    `;

    if (type === 'success') alertDiv.style.backgroundColor = '#27ae60';
    else if (type === 'error') alertDiv.style.backgroundColor = '#e74c3c';
    else alertDiv.style.backgroundColor = '#3498db';

    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function checkAuth() {
    return getCookie('token') !== null;
}

// Auth functions
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Registration successful! Please login.', 'success');
            window.location.href = '/login';
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Login successful!', 'success');
            window.location.href = '/dashboard';
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        showAlert('Logged out successfully', 'success');
        window.location.href = '/';
    } catch (error) {
        showAlert('Logout failed', 'error');
    }
}

// Expense functions
async function loadExpenses(page = 1, filters = {}) {
    try {
        const params = new URLSearchParams({ page, ...filters });
        const response = await fetch(`${API_BASE}/expenses?${params}`);
        const data = await response.json();

        if (response.ok) {
            displayExpenses(data.expenses);
        } else {
            showAlert('Failed to load expenses', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

function displayExpenses(expenses) {
    const container = document.getElementById('expensesContainer');
    container.innerHTML = '';

    if (expenses.length === 0) {
        container.innerHTML = '<p>No expenses found.</p>';
        return;
    }

    expenses.forEach(expense => {
        const expenseDiv = document.createElement('div');
        expenseDiv.className = 'expense-item';
        expenseDiv.innerHTML = `
            <div class="details">
                <strong>${expense.description}</strong>
                <br>
                <small>${expense.category} - ${new Date(expense.date).toLocaleDateString()}</small>
            </div>
            <div class="amount">$${expense.amount.toFixed(2)}</div>
            <div class="actions">
                <button class="edit-btn" onclick="editExpense('${expense._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteExpense('${expense._id}')">Delete</button>
            </div>
        `;
        container.appendChild(expenseDiv);
    });
}

async function addExpense(amount, category, date, description) {
    try {
        const response = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount), category, date, description }),
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Expense added successfully!', 'success');
            document.getElementById('expenseForm').reset();
            loadExpenses();
        } else {
            showAlert(data.message || 'Failed to add expense', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Expense deleted successfully!', 'success');
            loadExpenses();
        } else {
            showAlert('Failed to delete expense', 'error');
        }
    } catch (error) {
        showAlert('Network error', 'error');
    }
}

async function editExpense(id) {
    // This would open a modal or redirect to edit page
    // For simplicity, we'll just show an alert
    showAlert('Edit functionality would open a modal here', 'info');
}

// Dashboard functions
async function loadDashboard() {
    try {
        const [statsResponse, trendsResponse] = await Promise.all([
            fetch(`${API_BASE}/expenses/stats`),
            fetch(`${API_BASE}/expenses/trends`),
        ]);

        const stats = await statsResponse.json();
        const trends = await trendsResponse.json();

        if (statsResponse.ok) {
            document.getElementById('totalAmount').textContent = `$${stats.totalAmount.toFixed(2)}`;
            renderCategoryChart(stats.categoryBreakdown);
        }

        if (trendsResponse.ok) {
            renderMonthlyChart(trends);
        }
    } catch (error) {
        showAlert('Failed to load dashboard data', 'error');
    }
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item._id),
            datasets: [{
                data: data.map(item => item.total),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
            },
        },
    });
}

function renderMonthlyChart(data) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Expenses',
                data: months.map((_, index) => {
                    const monthData = data.find(item => item._id === index + 1);
                    return monthData ? monthData.total : 0;
                }),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.1,
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            register(
                formData.get('username'),
                formData.get('email'),
                formData.get('password')
            );
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            login(formData.get('email'), formData.get('password'));
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Expense form
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            addExpense(
                formData.get('amount'),
                formData.get('category'),
                formData.get('date'),
                formData.get('description')
            );
        });

        // Set default date to today
        document.getElementById('date').valueAsDate = new Date();
    }

    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const category = document.getElementById('filterCategory').value;

            const filters = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            if (category) filters.category = category;

            loadExpenses(1, filters);
        });
    }

    // Load expenses if on expenses page
    if (document.getElementById('expensesContainer')) {
        loadExpenses();
    }

    // Load dashboard if on dashboard page
    if (document.getElementById('monthlyChart')) {
        loadDashboard();
    }
});
