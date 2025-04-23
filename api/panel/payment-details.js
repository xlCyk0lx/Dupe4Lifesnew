// Import required modules
const jwt = require('jsonwebtoken');
const { getPaymentById } = require('../../lib/database');

// JWT secret key - should match the one used in login.js
const JWT_SECRET = process.env.JWT_SECRET || 'dupe4lifes-admin-secret-key';

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
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
    
    // Get payment ID from query
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    
    // Get payment details
    const payment = await getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Return payment details
    return res.status(200).json(payment);
    
  } catch (error) {
    console.error('Payment details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
