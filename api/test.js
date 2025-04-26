module.exports = (req, res) => {
  res.status(200).json({ 
    message: "API is working!",
    env: process.env.STRIPE_PUBLISHABLE_KEY ? "Stripe key is set" : "Stripe key is missing"
  });
};
