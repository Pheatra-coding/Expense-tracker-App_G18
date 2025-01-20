// auth.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
  } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
  import { auth } from "./firebase-config.js";
  
  // Register user
  export async function register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Swal.fire("Registration Successful", "You can now log in.", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }
  
  // Login user
  export async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Swal.fire("Login Successful", "Welcome back!", "success");
      return userCredential.user;
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }
  
  // Logout user
  export async function logout() {
    try {
      await signOut(auth);
      Swal.fire("Logged Out", "See you next time!", "info");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }
  
  // Observe auth state
  export function observeAuthState(onLogin, onLogout) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin(user);
      } else {
        onLogout();
      }
    });
  }
