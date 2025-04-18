async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!email || !password || !confirmPassword) {
        alert('All fields are required!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const hashedPassword = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ email, password: hashedPassword });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful!');
    const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
    modal.hide();
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('All fields are required!');
        return;
    }

    const hashedPassword = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.email === email && user.password === hashedPassword);

    if (user) {
        alert('Login successful!');
        // Optionally show expense UI here
    } else {
        alert('Invalid email or password!');
    }
}

document.querySelector('#signupModal form').addEventListener('submit', function(event) {
    event.preventDefault();
    signup();
});

document.querySelector('#loginModal form').addEventListener('submit', function(event) {
    event.preventDefault();
    login();
});

let currentEditIndex = null;

function addExpense() {
    const expenseName = document.getElementById('expenseName').value;
    const expenseAmount = document.getElementById('expenseAmount').value;
    const noteOfExpense = document.getElementById('Note_of_expance').value;
    const expenseDate = document.getElementById('expenseDate').value;

    if (!expenseName || !expenseAmount || !noteOfExpense || !expenseDate) {
        alert('All fields are required!');
        return;
    }

    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const expense = {
        name: expenseName,
        amount: parseFloat(expenseAmount),
        note: noteOfExpense,
        date: expenseDate,
    };

    if (currentEditIndex !== null) {
        expenses[currentEditIndex] = expense;
        currentEditIndex = null;
        alert('Expense updated successfully!');
    } else {
        expenses.push(expense);
        alert('Expense added successfully!');
    }

    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Clear form
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('Note_of_expance').value = '';
    document.getElementById('expenseDate').value = '';

    const modal = bootstrap.Modal.getInstance(document.getElementById('addExpenseModal'));
    modal.hide();

    displayExpenses();
}

function editExpense(index) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const expense = expenses[index];
    if (!expense) return;

    currentEditIndex = index;

    document.getElementById('expenseName').value = expense.name;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('Note_of_expance').value = expense.note;
    document.getElementById('expenseDate').value = expense.date;

    const modal = new bootstrap.Modal(document.getElementById('addExpenseModal'));
    modal.show();
}

function displayExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const expenseTableBody = document.getElementById('expenseTableBody');
    expenseTableBody.innerHTML = '';

    if (!Array.isArray(expenses)) {
        console.error('Expenses data is not an array:', expenses);
        return;
    }

    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${expense.name}</td>
            <td>${expense.amount.toFixed(2)}</td>
            <td>${expense.note}</td>
            <td>${expense.date}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="editExpense(${index})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteExpense(${index})">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
}

function deleteExpense(index) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
}

document.querySelector('#addExpenseModal form').addEventListener('submit', function(event) {
    event.preventDefault();
    addExpense();
});

window.onload = function() {
    displayExpenses();
};
