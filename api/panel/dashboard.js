// Import required modules
const jwt = require('jsonwebtoken');
const { getPayments, getSettings } = require('../../lib/database');

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
    
    // Get payments data
    const payments = await getPayments();
    
    // Get settings
    const settings = await getSettings();
    
    // Calculate dashboard stats
    const totalSales = payments.reduce((sum, payment) => {
      if (payment.status === 'succeeded') {
        return sum + (payment.amount / 100);
      }
      return sum;
    }, 0);
    
    const uniqueCustomers = new Set(payments.map(payment => payment.username));
    const totalCustomers = uniqueCustomers.size;
    
    const totalOrders = payments.filter(payment => payment.status === 'succeeded').length;
    
    // Return dashboard data
    return res.status(200).json({
      totalSales,
      totalCustomers,
      totalOrders,
      testMode: settings.testMode || true
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
