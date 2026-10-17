// ========================================
// Firebase Config - ضع بيانات مشروعك هنا
// ========================================
// بعد ما تعمل Get Started في Firebase، انسخ القيم من Project settings > Your apps

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (compat version for simplicity)
if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
  console.log("Firebase connected");
} else {
  window.db = null;
  console.warn("Firebase not configured yet - using localStorage fallback");
}
