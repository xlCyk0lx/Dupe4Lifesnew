const { kv } = require('@vercel/kv');

// Key for storing purchases in KV store
const PURCHASES_KEY = 'dupe4lifes_purchases';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Read purchases from KV store
    const purchases = await kv.get(PURCHASES_KEY) || [];
    
    // Return HTML with purchases
    return sendHtml(res, purchases);
  } catch (error) {
    console.error('Error reading purchases:', error);
    
    // Return HTML with error
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchases - Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #1a1a1a;
            color: #fff;
          }
          .error {
            background-color: #3a1e1e;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Error Loading Purchases</h1>
        <div class="error">
          <p>${error.message}</p>
        </div>
        <p><a href="/" style="color: #ff0000;">Return to Home</a></p>
      </body>
      </html>
    `);
  }
};

function sendHtml(res, purchases) {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Generate table rows for purchases
  const generateRows = (purchases) => {
    if (purchases.length === 0) {
      return '<tr><td colspan="6" style="text-align: center;">No purchases found</td></tr>';
    }
    
    return purchases.map(p => `
      <tr>
        <td>${p.username}</td>
        <td>${p.rank}</td>
        <td>${p.price}</td>
        <td>${p.item || p.rank}</td>
        <td>${formatDate(p.purchaseDate)}</td>
        <td>
          <span class="status ${getStatusClass(p)}">
            ${getStatusText(p)}
          </span>
          ${p.processedDate ? `<br><small>${formatDate(p.processedDate)}</small>` : ''}
        </td>
      </tr>
    `).join('');
  };
  
  // Get status class based on processed and claimed flags
  const getStatusClass = (purchase) => {
    if (purchase.claimed) return 'claimed';
    if (purchase.processed) return 'processed';
    return 'pending';
  };
  
  // Get status text based on processed and claimed flags
  const getStatusText = (purchase) => {
    if (purchase.claimed) return 'Claimed';
    if (purchase.processed) return 'Processed';
    return 'Pending';
  };
  
  // Send the HTML response
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Records</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #1a1a1a;
          color: #fff;
        }
        h1 {
          color: #ff0000;
          margin-bottom: 20px;
        }
        .summary {
          margin-bottom: 20px;
          background-color: #333;
          padding: 15px;
          border-radius: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #444;
        }
        th {
          background-color: #333;
          color: #ff0000;
        }
        tr:hover {
          background-color: #2a2a2a;
        }
        .status {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 0.8em;
        }
        .processed {
          background-color: #1e3a1e;
          color: #4CAF50;
        }
        .claimed {
          background-color: #1e3a3a;
          color: #00BCD4;
        }
        .pending {
          background-color: #3a331e;
          color: #FFC107;
        }
        .refresh {
          background-color: #ff0000;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .refresh:hover {
          background-color: #cc0000;
        }
      </style>
    </head>
    <body>
      <h1>Purchase Records</h1>
      
      <div class="summary">
        <p><strong>Total Purchases:</strong> ${purchases.length}</p>
        <p><strong>Pending:</strong> ${purchases.filter(p => !p.processed && !p.claimed).length}</p>
        <p><strong>Processed:</strong> ${purchases.filter(p => p.processed && !p.claimed).length}</p>
        <p><strong>Claimed:</strong> ${purchases.filter(p => p.claimed).length}</p>
      </div>
      
      <button class="refresh" onclick="window.location.reload()">Refresh</button>
      
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Rank</th>
            <th>Price</th>
            <th>Item</th>
            <th>Purchase Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${generateRows(purchases)}
        </tbody>
      </table>
      
      <p style="margin-top: 20px;">
        <a href="/" style="color: #ff0000;">Return to Home</a>
      </p>
    </body>
    </html>
  `);
}
