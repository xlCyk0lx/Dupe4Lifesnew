module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests for the form and POST for submission
  if (req.method === 'GET') {
    // Return a simple HTML form for testing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Purchase</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #1a1a1a;
            color: #fff;
          }
          h1 {
            color: #ff0000;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #333;
            border-radius: 4px;
            background-color: #333;
            color: #fff;
          }
          button {
            background-color: #ff0000;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          button:hover {
            background-color: #cc0000;
          }
          .result {
            margin-top: 20px;
            padding: 15px;
            background-color: #333;
            border-radius: 4px;
            display: none;
          }
        </style>
      </head>
      <body>
        <h1>Test Purchase</h1>
        <p>Use this form to simulate a purchase without payment processing.</p>
        
        <form id="testForm">
          <div class="form-group">
            <label for="username">Minecraft Username:</label>
            <input type="text" id="username" name="username" required>
          </div>
          
          <div class="form-group">
            <label for="rank">Rank:</label>
            <select id="rank" name="rank" required>
              <option value="vip">VIP</option>
              <option value="mvp">MVP</option>
              <option value="legend">Legend</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="price">Price ($):</label>
            <input type="number" id="price" name="price" step="0.01" value="9.99" required>
          </div>
          
          <div class="form-group">
            <label for="item">Item (optional):</label>
            <input type="text" id="item" name="item" placeholder="Leave blank to use rank name">
          </div>
          
          <button type="submit">Submit Test Purchase</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <script>
          document.getElementById('testForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const rank = document.getElementById('rank').value;
            const price = document.getElementById('price').value;
            const item = document.getElementById('item').value || rank;
            
            try {
              const response = await fetch('/api/track-purchase', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, rank, price, item })
              });
              
              const result = await response.json();
              
              const resultDiv = document.getElementById('result');
              resultDiv.style.display = 'block';
              
              if (response.ok) {
                resultDiv.innerHTML = '<h3>Purchase Recorded Successfully</h3><pre>' + JSON.stringify(result, null, 2) + '</pre>';
                resultDiv.style.backgroundColor = '#1e3a1e';
              } else {
                resultDiv.innerHTML = '<h3>Error</h3><pre>' + JSON.stringify(result, null, 2) + '</pre>';
                resultDiv.style.backgroundColor = '#3a1e1e';
              }
            } catch (error) {
              const resultDiv = document.getElementById('result');
              resultDiv.style.display = 'block';
              resultDiv.innerHTML = '<h3>Error</h3><p>' + error.message + '</p>';
              resultDiv.style.backgroundColor = '#3a1e1e';
            }
          });
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }
  
  // For POST requests, redirect to the track-purchase endpoint
  if (req.method === 'POST') {
    // This is just a proxy to the track-purchase endpoint
    const { username, rank, price, item } = req.body;
    
    if (!username || !rank) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Forward the request to the track-purchase endpoint
    // In a real implementation, you'd use a proper HTTP client
    // For simplicity, we're just returning the data
    return res.status(200).json({
      message: 'Test purchase request received. In production, this would be sent to the track-purchase endpoint.',
      data: { username, rank, price, item }
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};