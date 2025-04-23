// Import required modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { updateAdminPassword } = require('../../lib/database');

// JWT secret key - should match the one used in login.js
const JWT_SECRET = process.env.JWT_SECRET || 'dupe4lifes-admin-secret-key';

// In a real application, you would store this in a database
// For this example, we'll use a hardcoded user with a hashed password
const ADMIN_USER = {
  username: 'xlCyk0l',
  // This is a hashed version of 'Hina142143'
  passwordHash: '$2a$10$XJvXMZSYk8bhpzDJVCkFZe4KQZ5C1PQl7e9JylfgUVIRzIjLbQnDe'
};

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, ADMIN_USER.passwordHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password in database
    await updateAdminPassword(decodedToken.username, newPasswordHash);
    
    // Update our in-memory reference for this example
    ADMIN_USER.passwordHash = newPasswordHash;
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
