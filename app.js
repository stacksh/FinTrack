// Get elements
const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const descInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const list = document.getElementById("transaction-list");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const balance = document.getElementById("balance");
const barChart = document.getElementById("bar-chart");
const pieChart = document.getElementById("pie-chart");
const themeToggle = document.getElementById("theme-toggle");

// Transactions state
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Render all
function render() {
  list.innerHTML = "";
  let income = 0, expense = 0;

  transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.classList.add(t.category === "income" ? "income" : "expense");

    li.innerHTML = `
      <div class="transaction-left">
        <span class="symbol">${t.category === "income" ? "➕" : "➖"}</span>
        <span class="amount">₹${t.amount}</span>
        <span class="desc">${t.description}</span>
      </div>
      <div class="transaction-right">
        <span class="category">(${t.category})</span>
        <button class="delete-btn" onclick="deleteTransaction(${index})">❌</button>
      </div>
    `;
    list.appendChild(li);

    if (t.category === "income") income += t.amount;
    else expense += t.amount;
  });

  totalIncome.textContent = `₹${income}`;
  totalExpense.textContent = `₹${expense}`;
  balance.textContent = `₹${income - expense}`;

  updateCharts(income, expense);
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Add transaction
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const transaction = {
    amount: parseFloat(amountInput.value),
    description: descInput.value,
    category: categoryInput.value,
  };
  transactions.push(transaction);
  form.reset();
  render();
});

// Delete transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  render();
}

// Update charts
function updateCharts(income, expense) {
  // Bar chart
  barChart.innerHTML = "";
  const values = [income, expense];
  const maxVal = Math.max(...values, 100); // scaling
  values.forEach((val, i) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = (val / maxVal) * 180 + "px";
    bar.style.background = i === 0 ? "var(--income)" : "var(--expense)";
    barChart.appendChild(bar);
  });

  // Pie chart
  let total = income + expense;
  let incomePercent = total ? (income / total) * 100 : 0;
  pieChart.style.background = `conic-gradient(
    var(--income) 0% ${incomePercent}%,
    var(--expense) ${incomePercent}% 100%
  )`;
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Init
render();
