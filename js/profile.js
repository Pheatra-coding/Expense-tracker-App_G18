import { auth, database } from "./firebase-config.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

// Save User Data to Firebase
async function saveUserData(imageSrc, username) {
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const userRef = ref(database, "users/" + userId);

    try {
      await set(userRef, {
        profileImage: imageSrc,
        username: username,
      });
      console.log("User data saved to Firebase.");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  } else {
    console.log("User not authenticated.");
  }
}

// Load User Data from Firebase
async function loadUserData() {
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const userRef = ref(database, "users/" + userId);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.profileImage) {
          document.getElementById("profileImage").src = data.profileImage;
        }
        if (data.username) {
          document.getElementById("usernameInput").value = data.username;
        }
      } else {
        console.log("No user data found.");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  } else {
    console.log("User not authenticated.");
  }
}

// Handle Profile Image Upload
document.getElementById("imageUpload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageSrc = e.target.result;
      document.getElementById("profileImage").src = imageSrc;
      saveUserData(imageSrc, document.getElementById("usernameInput").value); // Save updated image
    };
    reader.readAsDataURL(file);
  }
});

// Handle Username Input
document.getElementById("usernameInput").addEventListener("input", function (event) {
  const username = event.target.value;
  saveUserData(document.getElementById("profileImage").src, username); // Save updated username
});

// Load Data on Page Load
auth.onAuthStateChanged((user) => {
  if (user) {
    loadUserData();
  } else {
    console.log("No user signed in.");
  }
});
