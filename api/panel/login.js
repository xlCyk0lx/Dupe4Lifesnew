// API endpoint for admin login
exports.handler = async function(event, context) {
  try {
      // Parse request body
      const body = JSON.parse(event.body);
      const { username, password } = body;
        
      // Simple authentication (in a real app, you'd use a database and proper password hashing)
      // This is just a placeholder for demonstration
      if (username === 'admin' && password === 'dupe4lifes') {
          // Generate a simple token (in a real app, use JWT or similar)
          const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
            
          return {
              statusCode: 200,
              body: JSON.stringify({
                  success: true,
                  token: token
              })
          };
      }
        
      return {
          statusCode: 401,
          body: JSON.stringify({
              success: false,
              error: 'Invalid username or password'
          })
      };
  } catch (error) {
      console.error('Login error:', error);
        
      return {
          statusCode: 500,
          body: JSON.stringify({
              success: false,
              error: 'Internal server error'
          })
      };
  }
};
