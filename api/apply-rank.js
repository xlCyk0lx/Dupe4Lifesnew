module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, rank } = req.body;
    
    // Validate inputs
    if (!username || !rank) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Successful payment: User ${username} purchased ${rank.toUpperCase()} rank`);
    
    res.status(200).json({ success: true, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'An error occurred while recording the payment' });
  }
};
