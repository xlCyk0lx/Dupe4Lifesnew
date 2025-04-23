// Import required modules
const jwt = require('jsonwebtoken');
const { getPayments } = require('../../lib/database');

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
    
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'date';
    const order = req.query.order || 'desc';
    const search = req.query.search || '';
    
    // Get all payments
    let payments = await getPayments();
    
    // Apply search filter if provided
    if (search) {
      payments = payments.filter(payment => 
        payment.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort payments
    payments.sort((a, b) => {
      let comparison = 0;
      
      switch (sort) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'rank':
          comparison = a.rank.localeCompare(b.rank);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
    
    // Calculate pagination
    const totalPayments = payments.length;
    const totalPages = Math.ceil(totalPayments / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Get paginated payments
    const paginatedPayments = payments.slice(startIndex, endIndex);
    
    // Return payments data
    return res.status(200).json({
      payments: paginatedPayments,
      page,
      limit,
      totalPayments,
      totalPages
    });
    
  } catch (error) {
    console.error('Payments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
