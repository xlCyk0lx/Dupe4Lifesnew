module.exports = (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('Config API called, returning publishable key');
    res.status(200).json({ 
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      message: 'Config API is working'
    });
  } catch (error) {
    console.error('Error in config API:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
};
