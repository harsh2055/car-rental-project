// 2) public/app.js
// IMPORTANT: Replace the firebaseConfig object below with your project's config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// quick anonymous sign-in for demo
signInAnonymously(auth).catch(console.error);

onAuthStateChanged(auth, user => {
  if(user) loadCars();
});

async function loadCars(){
  const carsDiv = document.getElementById('cars');
  carsDiv.innerHTML = '<em>Loading cars...</em>';
  const snap = await getDocs(collection(db, 'cars'));
  carsDiv.innerHTML = '';
  snap.forEach(docSnap => {
    const car = docSnap.data();
    const id = docSnap.id;
    const el = document.createElement('div');
    el.className = 'car';
    el.innerHTML = `
      <h3>${car.make} ${car.model} (${car.year || ''})</h3>
      <p>₹ ${car.price_per_day} / day — ${car.location || ''}</p>
      <p>${car.features ? car.features.join(', ') : ''}</p>
      <button data-id="${id}" data-price="${car.price_per_day}">Book</button>
    `;
    carsDiv.appendChild(el);
  });

  // attach listeners
  document.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const carId = e.target.dataset.id;
      const price = Number(e.target.dataset.price || 0);
      await bookFlow(carId, price);
    });
  });
}

async function bookFlow(carId, pricePerDay){
  const from = prompt('Start date (YYYY-MM-DD)');
  const to = prompt('End date (YYYY-MM-DD)');
  if(!from || !to) return alert('Dates required');
  const d1 = new Date(from);
  const d2 = new Date(to);
  const days = Math.max(1, Math.round((d2 - d1)/(1000*60*60*24))+1);
  const total = days * pricePerDay;
  if(!confirm(`Book for ${days} day(s). Total = ₹${total}. Continue?`)) return;

  // create booking in Firestore (status: pending)
  const booking = await addDoc(collection(db, 'bookings'), {
    carId,
    from_date: d1,
    to_date: d2,
    total_amount: total,
    status: 'pending',
    createdAt: serverTimestamp()
  });

  alert('Booking created (id: ' + booking.id + '). For payments: call your createOrder function from backend.');

  // Example: call Cloud Function to create Razorpay order (uncomment when function deployed)
  /*
  const resp = await fetch('/.netlify/functions/createOrder', { // replace with your functions URL
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: total * 100 })
  });
  const order = await resp.json();
  // open Razorpay checkout with order.id ...
  */
}

window.loadCars = loadCars; // expose for debugging