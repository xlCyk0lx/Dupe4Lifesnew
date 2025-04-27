const fs = require('fs');
const path = require('path');

// Path to our purchase log file
const PURCHASES_FILE = path.join(process.cwd(), 'data', 'purchases.json');

// Load existing purchases
function loadPurchases() {
  try {
    if (!fs.existsSync(PURCHASES_FILE)) {
      return [];
    }
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
    // Ensure directory exists
    const dataDir = path.dirname(PURCHASES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
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
  
  // GET request to fetch pending purchases
  if (req.method === 'GET') {
    const purchases = loadPurchases();
    const pendingPurchases = purchases.filter(p => !p.processed);
    
    return res.status(200).json({
      success: true,
      count: pendingPurchases.length,
      purchases: pendingPurchases
    });
  }
  
  // POST request to mark purchases as processed
  if (req.method === 'POST') {
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
      return res.status(200).json({
        success: true,
        message: 'Purchase marked as processed',
        purchase: purchases[purchaseIndex]
      });
    } else {
      return res.status(500).json({ error: 'Failed to update purchase' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};