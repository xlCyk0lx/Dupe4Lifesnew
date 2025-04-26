module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log("Config API called");
  console.log("Stripe key exists:", !!process.env.STRIPE_PUBLISHABLE_KEY);
  
  // Return the publishable key
  return res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'missing-key',
    timestamp: new Date().toISOString()
  });
};
