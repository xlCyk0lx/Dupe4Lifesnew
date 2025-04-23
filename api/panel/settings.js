// Import required modules
const jwt = require('jsonwebtoken');
const { getSettings, updateSettings } = require('../../lib/database');

// JWT secret key - should match the one used in login.js
const JWT_SECRET = process.env.JWT_SECRET || 'dupe4lifes-admin-secret-key';

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Handle GET request - return current settings
    if (req.method === 'GET') {
      const settings = await getSettings();
      return res.status(200).json(settings);
    }
    
    // Handle POST request - update settings
    if (req.method === 'POST') {
      const { type } = req.body;
      
      if (!type) {
        return res.status(400).json({ error: 'Settings type is required' });
      }
      
      // Get current settings
      const currentSettings = await getSettings();
      let updatedSettings = { ...currentSettings };
      
      // Update payment settings
      if (type === 'payment') {
        const { testMode, testPublishableKey, testSecretKey, livePublishableKey, liveSecretKey } = req.body;
        
        updatedSettings = {
          ...updatedSettings,
          testMode,
          testPublishableKey,
          testSecretKey,
          livePublishableKey,
          liveSecretKey
        };
      }
      
      // Update store settings
      if (type === 'store') {
        const { storeEnabled, prices } = req.body;
        
        updatedSettings = {
          ...updatedSettings,
          storeEnabled,
          prices
        };
      }
      
      // Save updated settings
      await updateSettings(updatedSettings);
      
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method Not Allowed' });
    
  } catch (error) {
    console.error('Settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
