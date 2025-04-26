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
    const { username, rank } = req.body;
    
    if (!username || !rank) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Here you would implement the logic to apply the rank to the user
    // This might involve calling a Minecraft server API, updating a database, etc.
    console.log(`Applying ${rank} rank to user ${username}`);
    
    // For example, you might call a Minecraft server RCON command
    // or update a database record with the user's new rank
    
    // For now, we'll just return success
    return res.status(200).json({
      success: true,
      message: `Successfully applied ${rank} rank to ${username}`
    });
  };
  