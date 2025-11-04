// 6) functions/index.js
// Simple Cloud Function to create a Razorpay order. Requires functions config set:
// firebase functions:config:set razorpay.key_id="rzp_..." razorpay.key_secret="..."

const functions = require('firebase-functions');
const express = require('express');
const Razorpay = require('razorpay');

const app = express();
app.use(express.json());

app.post('/createOrder', async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise
    if(!amount) return res.status(400).json({ error: 'amount required' });
    const key_id = functions.config().razorpay?.key_id;
    const key_secret = functions.config().razorpay?.key_secret;
    if(!key_id || !key_secret) return res.status(500).json({ error: 'Razorpay keys not configured' });

    const rzp = new Razorpay({ key_id, key_secret });
    const order = await rzp.orders.create({ amount: Number(amount), currency: 'INR', receipt: 'rcpt_' + Date.now() });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

exports.api = functions.https.onRequest(app);