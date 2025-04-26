const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    try {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
        
        // Handle OPTIONS request for CORS preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        // Parse request body
        const { username, rank } = req.body;
        
        if (!username || !rank) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Validate that this is for the BETA rank
        if (rank !== 'beta') {
            return res.status(400).json({ error: 'Invalid rank for setup intent' });
        }
        
        // Create a SetupIntent
        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            usage: 'off_session',
            metadata: {
                username: username,
                rank: rank,
                free: 'true'
            }
        });
        
        // Return the client secret
        return res.status(200).json({
            clientSecret: setupIntent.client_secret
        });
    } catch (error) {
        console.error('Setup intent error:', error);
        
        return res.status(500).json({
            error: 'Failed to create setup intent'
        });
    }
};
