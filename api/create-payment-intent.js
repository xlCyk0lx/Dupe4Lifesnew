const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Parse request body
  const { username, rank, amount } = req.body;
  
  if (!username || !rank || amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // If this is the BETA rank with $0, redirect to setup intent
  if (rank === 'beta' && parseInt(amount) === 0) {
    return res.status(400).json({
      error: 'Free ranks should use the setup intent endpoint'
    });
  }
  
  // Create a PaymentIntent
  stripe.paymentIntents.create({
    amount: parseInt(amount),
    currency: 'usd',
    metadata: {
      username: username,
      rank: rank
    }
  })
  .then(paymentIntent => {
    // Return the client secret
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  })
  .catch(error => {
    console.error('Payment intent error:', error);
    
    return res.status(500).json({
      error: 'Failed to create payment intent'
    });
  });
};
