module.exports = async (req, res) => {
  try {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
      
      // Handle OPTIONS request for CORS preflight
      if (req.method === 'OPTIONS') {
          return res.status(200).end();
      }
      
      // Only allow GET requests
      if (req.method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed' });
      }
      
      // Return the publishable key
      return res.status(200).json({
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      });
  } catch (error) {
      console.error('Config error:', error);
      
      return res.status(500).json({
          error: 'Failed to retrieve configuration'
      });
  }
};
