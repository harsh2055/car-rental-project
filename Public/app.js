// --- DriveIndia Car Rental Frontend Demo ---
// Make sure you have added your Firebase config below ↓
// and Firestore has a collection named "cars"

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Replace this config with your Firebase project's config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "car-rental-website-9d548.firebaseapp.com",
  projectId: "car-rental-website-9d548",
  storageBucket: "car-rental-website-9d548.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const carsDiv = document.getElementById("cars");
carsDiv.innerHTML = "<p>Loading available cars...</p>";

async function loadCars() {
  try {
    const querySnapshot = await getDocs(collection(db, "cars"));
    if (querySnapshot.empty) {
      carsDiv.innerHTML = `
        <p>No cars found in Firestore.</p>
        <p>Go to Firebase Console → Firestore → Add Collection "cars" → Add documents.</p>
      `;
      return;
    }

    let html = '<div class="car-list">';
    querySnapshot.forEach(doc => {
      const car = doc.data();
      html += `
        <div class="car-card">
          <h2>${car.make} ${car.model}</h2>
          <p><strong>Year:</strong> ${car.year}</p>
          <p><strong>