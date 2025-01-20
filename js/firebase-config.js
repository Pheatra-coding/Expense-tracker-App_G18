import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVK3k4Kvjp2qcQF31oENHmFosydNl8zQw",
  authDomain: "expense-tracker-c021c.firebaseapp.com",
  databaseURL: "https://expense-tracker-c021c-default-rtdb.firebaseio.com",
  projectId: "expense-tracker-c021c",
  storageBucket: "expense-tracker-c021c.firebasestorage.app",
  messagingSenderId: "300369135034",
  appId: "1:300369135034:web:d9a9d62df93ac52fa60983",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database }; // Correct export
