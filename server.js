require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/store', (req, res) => {
    res.sendFile(path.join(__dirname, 'store.html'));
});

app.get('/portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'portal.html'));
});

// Provide the publishable key to the frontend
app.get('/api/config', (req, res) => {
    res.json({ 
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
    });
});

// API Endpoints
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { rank, amount, username } = req.body;
        
        // Validate inputs
        if (!rank || !amount || !username) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount),
            currency: 'usd',
            metadata: {
                rank: rank,
                username: username
            }
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'An error occurred while processing your payment' });
    }
});

// Simplified endpoint for successful payments (just logs the data for now)
app.post('/api/apply-rank', async (req, res) => {
    try {
        const { username, rank } = req.body;
        
        // Validate inputs
        if (!username || !rank) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Log the successful payment (we'll implement Minecraft integration later)
        console.log(`Successful payment: User ${username} purchased ${rank.toUpperCase()} rank`);
        
        res.json({ success: true, message: 'Payment recorded successfully' });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'An error occurred while recording the payment' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the website`);
});
