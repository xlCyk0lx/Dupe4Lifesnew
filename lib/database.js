// In a real application, this would connect to a database
// For this example, we'll use in-memory storage

// Sample data
let payments = [
  {
    id: 'pi_1NqRcXKFJz7PBUDl0bUYGnxR',
    date: '2023-10-15T14:32:45Z',
    username: 'DragonSlayer42',
    rank: 'vip',
    amount: 599,
    status: 'succeeded',
    paymentMethod: 'Visa **** 4242',
    testMode: true
  },
  {
    id: 'pi_2MrTdYLGKz8QCVEm1cVZHoyS',
    date: '2023-10-14T09:17:22Z',
    username: 'MineKing99',
    rank: 'legend',
    amount: 2999,
    status: 'succeeded',
    paymentMethod: 'Mastercard **** 5555',
    testMode: true
  },
  {
    id: 'pi_3OsTfZMHLa9RDWFn2dWAIpzT',
    date: '2023-10-13T18:45:10Z',
    username: 'CreeperHunter',
    rank: 'mvp',
    amount: 1499,
    status: 'succeeded',
    paymentMethod: 'Amex **** 3782',
    testMode: true
  },
  {
    id: 'pi_4PuUgANIMb0SEXGo3eXBJqaU',
    date: '2023-10-12T11:23:05Z',
    username: 'DiamondMiner',
    rank: 'vip',
    amount: 599,
    status: 'succeeded',
    paymentMethod: 'Visa **** 9876',
    testMode: true
  },
  {
    id: 'pi_5QvVhBOJNc1TFYHp4fYCKrbV',
    date: '2023-10-11T15:56:30Z',
    username: 'EndermanSlayer',
    rank: 'legend',
    amount: 2999,
    status: 'failed',
    paymentMethod: 'Mastercard **** 2468',
    testMode: true
  }
];

// Settings
let settings = {
  testMode: true,
  testPublishableKey: 'pk_test_51NqRcXKFJz7PBUDl0bUYGnxR',
  testSecretKey: 'sk_test_51NqRcXKFJz7PBUDl0bUYGnxR',
  livePublishableKey: '',
  liveSecretKey: '',
  storeEnabled: false,
  prices: {
    vip: 5.99,
    mvp: 14.99,
    legend: 29.99
  }
};

// Get all payments
async function getPayments() {
  return [...payments];
}

// Get payment by ID
async function getPaymentById(id) {
  return payments.find(payment => payment.id === id) || null;
}

// Add a new payment
async function addPayment(payment) {
  payments.push(payment);
  return payment;
}

// Get settings
async function getSettings() {
  return { ...settings };
}

// Update settings
async function updateSettings(newSettings) {
  settings = { ...newSettings };
  return settings;
}

// Update admin password
async function updateAdminPassword(username, passwordHash) {
  // In a real application, this would update the database
  console.log(`Password updated for user: ${username}`);
  return true;
}

module.exports = {
  getPayments,
  getPaymentById,
  addPayment,
  getSettings,
  updateSettings,
  updateAdminPassword
};
