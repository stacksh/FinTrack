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
const formError = document.getElementById("form-error");

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
  renderCategoryBreakdown();
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Add transaction
form.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.textContent = ""; // Clear previous error

  const amountValue = amountInput.value.trim();
  const amount = parseFloat(amountValue);

  if (!amountValue || isNaN(amount) || amount <= 0) {
    formError.textContent = "Please enter a valid positive number for amount.";
    amountInput.focus();
    return;
  }

  const transaction = {
    amount: amount,
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
  const labels = ["Income", "Expense"];
  const maxBarHeight = 160; // px, matches your CSS
  const minBarHeight = 30;  // px, for visibility
  const maxVal = Math.max(...values, 100); // scaling

  values.forEach((val, i) => {
    const group = document.createElement("div");
    group.className = "bar-group";

    // Value label
    const valueLabel = document.createElement("div");
    valueLabel.className = "bar-value";
    valueLabel.textContent = `₹${val}`;
    group.appendChild(valueLabel);

    // Bar
    const bar = document.createElement("div");
    bar.className = "bar " + (i === 0 ? "income" : "expense");
    // Calculate proportional height, but clamp to maxBarHeight
    let barHeight = minBarHeight;
    if (maxVal > 0) {
      barHeight = Math.max(
        minBarHeight,
        Math.round((val / maxVal) * maxBarHeight)
      );
    }
    bar.style.height = barHeight + "px";
    group.appendChild(bar);

    // Label
    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = labels[i];
    group.appendChild(label);

    barChart.appendChild(group);
  });

  // Pie chart
  let total = income + expense;
  let incomePercent = total ? (income / total) * 100 : 0;
  pieChart.style.background = `conic-gradient(
    var(--income) 0% ${incomePercent}%,
    var(--expense) ${incomePercent}% 100%
  )`;
}

function renderCategoryBreakdown() {
  const categoryList = document.getElementById("category-list");
  const categoryBarChart = document.getElementById("category-bar-chart");
  if (!categoryList || !categoryBarChart) return;

  // Aggregate totals per category
  const catTotals = {};
  let maxAmount = 0;
  transactions.forEach(t => {
    if (!catTotals[t.category]) catTotals[t.category] = 0;
    catTotals[t.category] += t.amount;
    if (catTotals[t.category] > maxAmount) maxAmount = catTotals[t.category];
  });

  // List view
  categoryList.innerHTML = "";
  Object.entries(catTotals).forEach(([cat, amt]) => {
    const item = document.createElement("div");
    item.className = "category-item";
    item.innerHTML = `
      <span class="cat-label">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
      <span class="cat-amount">₹${amt}</span>
    `;
    categoryList.appendChild(item);
  });

  // Bar chart view
  categoryBarChart.innerHTML = "";
  Object.entries(catTotals).forEach(([cat, amt]) => {
    const row = document.createElement("div");
    row.className = "cat-bar-row";
    const label = document.createElement("span");
    label.className = "cat-bar-label";
    label.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);

    const bar = document.createElement("div");
    bar.className = "cat-bar " + (cat === "income" ? "income" : "expense");
    bar.style.width = maxAmount > 0 ? `${(amt / maxAmount) * 70 + 30}%` : "30%";

    const amount = document.createElement("span");
    amount.className = "cat-bar-amount";
    amount.textContent = `₹${amt}`;

    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(amount);
    categoryBarChart.appendChild(row);
  });
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Init
render();

// Clerk authentication logic
window.addEventListener("DOMContentLoaded", async () => {
  if (!window.Clerk) {
    alert("Clerk failed to load. Please check your internet connection or Clerk configuration.");
    return;
  }
  await window.Clerk.load();

  const signIn = document.getElementById("sign-in");
  const userButton = document.getElementById("user-button");
  const appRoot = document.getElementById("app-root");

  window.Clerk.addListener(({ user }) => {
    if (user) {
      signIn.style.display = "none";
      userButton.style.display = "block";
      appRoot.style.display = "block";
      render();
    } else {
      signIn.style.display = "block";
      userButton.style.display = "none";
      appRoot.style.display = "none";
    }
  });

  if (window.Clerk.user) {
    signIn.style.display = "none";
    userButton.style.display = "block";
    appRoot.style.display = "block";
    render();
  } else {
    signIn.style.display = "block";
    userButton.style.display = "none";
    appRoot.style.display = "none";
  }
});
