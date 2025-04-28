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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET request to fetch purchases (for the plugin to consume)
  if (req.method === 'GET') {
    // Check for API key (simple security)
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MINECRAFT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const purchases = await loadPurchases();
    
    // Filter by username if provided
    if (req.query.username) {
      const username = req.query.username.toLowerCase();
      const userPurchases = purchases.filter(p => 
        p.username.toLowerCase() === username && !p.processed && !p.claimed
      );
      return res.status(200).json(userPurchases);
    }
    
    // By default, only return unprocessed and unclaimed purchases for the plugin
    const unprocessedPurchases = purchases.filter(p => !p.processed && !p.claimed);
    return res.status(200).json(unprocessedPurchases);
  }
  
  // POST request to add a new purchase (from the website)
  if (req.method === 'POST') {
    const { username, rank, price, item } = req.body;
    
    if (!username || !rank) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const purchases = await loadPurchases();
    
    // Add new purchase
    const newPurchase = {
      id: Date.now().toString(),
      username,
      rank,
      price: price || 0,
      item: item || rank, // Default item to rank if not specified
      purchaseDate: new Date().toISOString(),
      processed: false,
      claimed: false
    };
    
    purchases.push(newPurchase);
    
    if (await savePurchases(purchases)) {
      return res.status(201).json(newPurchase);
    } else {
      return res.status(500).json({ error: 'Failed to save purchase' });
    }
  }
  
  // PUT request to mark purchases as processed (for the plugin to update)
  if (req.method === 'PUT') {
    // Check for API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MINECRAFT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid purchase IDs' });
    }
    
    const purchases = await loadPurchases();
    let updatedCount = 0;
    
    // Mark each purchase as processed
    for (let i = 0; i < purchases.length; i++) {
      if (ids.includes(purchases[i].id)) {
        purchases[i].processed = true;
        purchases[i].claimed = true;
        purchases[i].processedDate = new Date().toISOString();
        updatedCount++;
      }
    }
    
    if (updatedCount === 0) {
      return res.status(404).json({ error: 'No matching purchases found' });
    }
    
    if (await savePurchases(purchases)) {
      return res.status(200).json({
        success: true,
        message: `Successfully marked ${updatedCount} purchases as processed`
      });
    } else {
      return res.status(500).json({ error: 'Failed to update purchases' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};
