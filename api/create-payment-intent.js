import Stripe from 'stripe';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { rank, amount, username } = req.body;
    
    // Validate inputs
    if (!rank || !amount || !username) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Creating payment intent for ${username}, rank: ${rank}, amount: ${amount}`);
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: 'usd',
      metadata: {
        rank: rank,
        username: username
      }
    });
    
    console.log('Payment intent created successfully');
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'An error occurred while processing your payment' });
  }
}
