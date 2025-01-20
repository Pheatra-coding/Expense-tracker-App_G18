import { login, register, logout } from "./auth.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { getDatabase, ref, set, push, get, child, remove } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js"; 

// Firebase setup
const database = getDatabase();

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authContainer = document.getElementById("authContainer");
  const expenseTrackerContainer = document.getElementById("expenseTrackerContainer");
  const navbarLoginBtn = document.getElementById("navbarLoginBtn");
  const navbarLogoutBtn = document.getElementById("navbarLogoutBtn");
  const sidebar = document.getElementById("sidebar");
  const backgroundImg = document.getElementById("background-img");

  // Switch between login and register forms
  document.getElementById("registerLink").addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  });

  document.getElementById("loginLink").addEventListener("click", () => {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  // Login
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    await login(email, password);
  });

  // Register
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    await register(email, password);
  });

  // Logout
  navbarLogoutBtn.addEventListener("click", async () => {
    await logout();
  });

  // Observe auth state
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      authContainer.style.display = "none";
      expenseTrackerContainer.style.display = "block";
      navbarLoginBtn.style.display = "none";
      navbarLogoutBtn.style.display = "block";
      sidebar.style.display = "block";
      backgroundImg.style.display = "none";

      // Load transactions from Firebase
      loadTransactions(user.uid);
    } else {
      // No user is signed in
      authContainer.style.display = "block";
      expenseTrackerContainer.style.display = "none";
      navbarLoginBtn.style.display = "block";
      navbarLogoutBtn.style.display = "none";
      sidebar.style.display = "none";
      backgroundImg.style.display = "block";
    }
  });
});

let transactions = [];

function updateCards() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  // Update the card values
  document.getElementById("balance").textContent = balance;
  document.getElementById("totalIncome").textContent = totalIncome;
  document.getElementById("totalExpense").textContent = totalExpense;

  updateCharts(totalIncome, totalExpense, balance);
}

function updateTransactionsTable(transactionsToRender) {
  const tableBody = document.querySelector("#transactionsTable tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  transactionsToRender.forEach((transaction, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${transaction.category}</td>
      <td>${transaction.type}</td>
      <td>${transaction.amount} $</td>
      <td>
        <button class="btn btn-danger delete-btn" data-id="${transaction.id}"><i class="fa-solid fa-trash"></i> Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners for delete buttons
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      const transactionId = event.target.dataset.id;
      deleteTransaction(transactionId);
    });
  });
}

document.getElementById("transactionForm").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const transactionType = document.getElementById("transactionType").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
  
    // Get the current user ID
    const user = getAuth().currentUser;
  
    if (user) {
      // Add the new transaction to the Firebase database
      const transactionRef = ref(database, 'transactions/' + user.uid);
      const newTransactionKey = push(transactionRef).key;
  
      const transactionData = {
        id: newTransactionKey, // Add an ID to identify the transaction
        type: transactionType,
        category: category,
        amount: amount,
        date: date
      };
  
      set(ref(database, 'transactions/' + user.uid + '/' + newTransactionKey), transactionData)
        .then(() => {
          // After saving to Firebase, update the UI
          transactions.push(transactionData);
          updateCards();
          updateTransactionsTable(transactions);
  
          // Clear the form inputs
          transactionForm.reset();
  
  
          // Show SweetAlert success message
          Swal.fire({
            icon: 'success',
            title: 'Transaction Added',
            text: 'Your transaction has been successfully added!',
            timer: 2000,
            showConfirmButton: false
          });
        })
        .catch((error) => {
          // Show SweetAlert error message
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add transaction. Please try again.',
          });
        });
    }
  });

  // Define deleteTransaction function
function deleteTransaction(transactionId) {
    const user = getAuth().currentUser;
  
    if (user) {
      // Remove the transaction from Firebase
      const transactionRef = ref(database, 'transactions/' + user.uid + '/' + transactionId);
      remove(transactionRef)
        .then(() => {
          // Remove the transaction from the local transactions array
          transactions = transactions.filter(transaction => transaction.id !== transactionId);
          updateCards();
          updateTransactionsTable(transactions);
        })
        .catch((error) => {
          console.error("Error deleting transaction:", error);
        });
    }
  }
  
  let balanceChart, incomeChart, expenseChart;
  
  function createCharts() {
    const ctxBalance = document.getElementById("balanceChart").getContext("2d");
    const ctxIncome = document.getElementById("incomeChart").getContext("2d");
    const ctxExpense = document.getElementById("expenseChart").getContext("2d");
  
    balanceChart = new Chart(ctxBalance, {
      type: 'bar',
      data: {
        labels: ['Balance'],
        datasets: [{
          data: [0],
          backgroundColor: ['#4CAF50']
        }]
      }
    });
  
    incomeChart = new Chart(ctxIncome, {
      type: 'bar',
      data: {
        labels: ['Income'],
        datasets: [{
          data: [0],
          backgroundColor: '#4CAF50'
        }]
      }
    });
  
    expenseChart = new Chart(ctxExpense, {
      type: 'bar',
      data: {
        labels: ['Expense'],
        datasets: [{
          data: [0],
          backgroundColor: '#FF5733'
        }]
      }
    });
  }
  function updateCharts(totalIncome, totalExpense, balance) {
    // Update balance chart
    balanceChart.data.datasets[0].data = [balance];
    balanceChart.update();
  
    // Update income chart
    incomeChart.data.datasets[0].data = [totalIncome];
    incomeChart.update();
  
    // Update expense chart
    expenseChart.data.datasets[0].data = [totalExpense];
    expenseChart.update();
  }
  
  // Initialize charts on page load
  createCharts();
  
  // Load transactions from Firebase
  function loadTransactions(userId) {
    const transactionsRef = ref(database, 'transactions/' + userId);
    get(transactionsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          transactions = Object.values(snapshot.val()).map((transaction, index) => ({
            ...transaction,
            id: Object.keys(snapshot.val())[index] // Add the transaction ID
          }));
          updateCards();
          updateTransactionsTable(transactions);
        } else {
          console.log("No transactions found for the user.");
        }
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
      });
  }
  
  // Export to PDF
  document.getElementById("exportPDF").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    // Capture the table's HTML
    const table = document.getElementById("transactionsTable");
  
    // Remove the "Action" column before exporting
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td, th");
      if (cells.length > 4) {
        // Remove the "Action" column (usually the last column)
        row.removeChild(cells[cells.length - 1]);
      }
    });
    
    // Use the table without the "Action" column to generate the PDF
  doc.autoTable({ html: table });

  // Save the generated PDF
  doc.save("transactions.pdf");

  // Optionally, you can restore the "Action" column if you want to keep it visible in the UI.
  rows.forEach(row => {
    const cells = row.querySelectorAll("td, th");
    if (cells.length < 5) {
      const actionCell = document.createElement("td");
      actionCell.textContent = "Action"; // Optionally, restore "Action" column
      row.appendChild(actionCell);
    }
  });
});

// Search functionality
document.getElementById("searchButton").addEventListener("click", () => {
  const searchTerm = document.getElementById("searchTerm").value.toLowerCase();

  // If the search term is empty, show all transactions
  if (searchTerm === "") {
    updateTransactionsTable(transactions);  // Show all transactions
  } else {
    // Filter transactions based on the search term
    const filteredTransactions = transactions.filter(transaction => {
      return transaction.date.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm) ||
        transaction.amount.toString().includes(searchTerm);
    });

    updateTransactionsTable(filteredTransactions); // Show filtered results
  }
});


document.getElementById("clearAllData").addEventListener("click", () => {
  const user = getAuth().currentUser;

  if (user) {
    // Use SweetAlert for confirmation
    Swal.fire({
      title: 'Are you sure?',
      text: "This action will delete all your data and cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear all data!',
      cancelButtonText: 'No, keep my data',
    }).then((result) => {
      if (result.isConfirmed) {
        // Get a reference to the transactions in Firebase
        const transactionsRef = ref(database, 'transactions/' + user.uid);

        // Remove all transactions from Firebase
        remove(transactionsRef)
          .then(() => {
            // Clear the local transactions array and update the UI
            transactions = [];
            updateCards();
            updateTransactionsTable(transactions);
            Swal.fire(
              'Cleared!',
              'All your data has been cleared.',
              'success'
            );
          })
          .catch((error) => {
            console.error("Error clearing data:", error);
            Swal.fire(
              'Error!',
              'There was a problem clearing your data. Please try again.',
              'error'
            );
          });
      } else {
        Swal.fire(
          'Cancelled',
          'Your data is safe!',
          'info'
        );
      }
    });
  } else {
    Swal.fire(
      'Not Logged In',
      'You need to be logged in to clear the data.',
      'warning'
    );
  }
});
