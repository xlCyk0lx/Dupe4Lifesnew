const fs = require('fs');
const path = require('path');

// Path to our purchase log file
const PURCHASES_FILE = path.join(process.cwd(), 'data', 'purchases.json');

// Ensure the data directory exists
function ensureDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create purchases file if it doesn't exist
  if (!fs.existsSync(PURCHASES_FILE)) {
    fs.writeFileSync(PURCHASES_FILE, JSON.stringify([]));
  }
}

// Load existing purchases
function loadPurchases() {
  try {
    const data = fs.readFileSync(PURCHASES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading purchases:', error);
    return [];
  }
}

// Save purchases to file
function savePurchases(purchases) {
  try {
    fs.writeFileSync(PURCHASES_FILE, JSON.stringify(purchases, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving purchases:', error);
    return false;
  }
}

module.exports = (req, res) => {
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
    
    ensureDirectoryExists();
    const purchases = loadPurchases();
    
    // Optional: Add query parameters to filter purchases
    const { processed } = req.query;
    
    let filteredPurchases = purchases;
    
    // Filter by processed status if specified
    if (processed !== undefined) {
      const isProcessed = processed === 'true';
      filteredPurchases = purchases.filter(p => p.processed === isProcessed);
    }
    
    return res.status(200).json(filteredPurchases);
  }
  
  // POST request to add a new purchase (from the website)
  if (req.method === 'POST') {
    ensureDirectoryExists();
    
    const { username, rank, price, item } = req.body;
    
    if (!username || !rank) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const purchases = loadPurchases();
    
    // Add new purchase
    const newPurchase = {
      id: Date.now().toString(),
      username,
      rank,
      price: price || 0,
      item: item || rank, // Default item to rank if not specified
      purchaseDate: new Date().toISOString(),
      processed: false
    };
    
    purchases.push(newPurchase);
    
    if (savePurchases(purchases)) {
      return res.status(201).json(newPurchase);
    } else {
      return res.status(500).json({ error: 'Failed to save purchase' });
    }
  }
  
  // PUT request to mark a purchase as processed (for the plugin to update)
  if (req.method === 'PUT') {
    // Check for API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.MINECRAFT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    ensureDirectoryExists();
    
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing purchase ID' });
    }
    
    const purchases = loadPurchases();
    const purchaseIndex = purchases.findIndex(p => p.id === id);
    
    if (purchaseIndex === -1) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    // Mark as processed
    purchases[purchaseIndex].processed = true;
    purchases[purchaseIndex].processedDate = new Date().toISOString();
    
    if (savePurchases(purchases)) {
      return res.status(200).json(purchases[purchaseIndex]);
    } else {
      return res.status(500).json({ error: 'Failed to update purchase' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};