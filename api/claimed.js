const { kv } = require('@vercel/kv');

// Key for storing purchases in KV store
const PURCHASES_KEY = 'dupe4lifes_purchases';

// Load existing purchases
async function loadPurchases() {
  try {
    const purchases = await kv.get(PURCHASES_KEY);
    return purchases || [];
  } catch (error) {
    console.error('Error loading purchases:', error);
    return [];
  }
}

// Save purchases to KV store
async function savePurchases(purchases) {
  try {
    await kv.set(PURCHASES_KEY, purchases);
    return true;
  } catch (error) {
    console.error('Error saving purchases:', error);
    return false;
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check for API key (simple security)
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.MINECRAFT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // POST request to update claim status
  if (req.method === 'POST') {
    const { username, claimed, purchaseId } = req.body;
    
    if (!username || claimed === undefined || !purchaseId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const purchases = await loadPurchases();
    
    // Find the purchase by ID
    const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);
    
    if (purchaseIndex === -1) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // Update the claimed status
    purchases[purchaseIndex].claimed = claimed;
    
    // Add timestamp if claimed
    if (claimed) {
      purchases[purchaseIndex].processedDate = new Date().toISOString();
      // Also mark as processed for backward compatibility
      purchases[purchaseIndex].processed = true;
    }
    
    // Save the updated purchases
    if (await savePurchases(purchases)) {
      return res.status(200).json({ 
        success: true, 
        message: `Successfully updated claim status for ${username}'s purchase` 
      });
    } else {
      return res.status(500).json({ error: 'Failed to update purchase' });
    }
  }
  
  // GET request to check claim status
  if (req.method === 'GET') {
    const { username, purchaseId } = req.query;
    
    if (!username && !purchaseId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const purchases = await loadPurchases();
    
    if (purchaseId) {
      // Find the purchase by ID
      const purchase = purchases.find(p => p.id === purchaseId);
      
      if (!purchase) {
        return res.status(404).json({ error: 'Purchase not found' });
      }
      
      // Return the claim status
      return res.status(200).json({
        username: purchase.username,
        claimed: purchase.claimed || false,
        processed: purchase.processed || false,
        claimedDate: purchase.processedDate || null
      });
    } else if (username) {
      // Find all purchases for this username
      const userPurchases = purchases.filter(p => 
        p.username.toLowerCase() === username.toLowerCase()
      );
      
      // Return all claim statuses
      return res.status(200).json(
        userPurchases.map(p => ({
          id: p.id,
          username: p.username,
          rank: p.rank,
          claimed: p.claimed || false,
          processed: p.processed || false,
          claimedDate: p.processedDate || null
        }))
      );
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};
