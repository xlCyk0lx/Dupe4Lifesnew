module.exports = async (req, res) => {
  try {
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
      const { username, rank } = req.body;
        
      if (!username || !rank) {
          return res.status(400).json({ error: 'Missing required fields' });
      }
        
      // In a real implementation, you would:
      // 1. Connect to your Minecraft server via RCON or API
      // 2. Apply the rank to the player
      // 3. Log the transaction in your database
        
      // For this example, we'll just simulate success
      console.log(`Applied ${rank} rank to ${username}`);
        
      // Record the transaction in your database
      // This is where you would store the purchase information
        
      // Return success
      return res.status(200).json({
          success: true,
          message: `Successfully applied ${rank.toUpperCase()} rank to ${username}`
      });
  } catch (error) {
      console.error('Apply rank error:', error);
        
      return res.status(500).json({
          error: 'Failed to apply rank'
      });
  }
};
