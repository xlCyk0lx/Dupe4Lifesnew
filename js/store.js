// Stripe initialization
let stripe;
let card;
let selectedRank;
let selectedPrice;

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch the publishable key from the server
        const response = await fetch('/api/config');
        const { publishableKey } = await response.json();
        
        // Initialize Stripe with the publishable key
        stripe = Stripe(publishableKey);
        
        // Set up Stripe card element
        const elements = stripe.elements();
        card = elements.create('card', {
            style: {
                base: {
                    iconColor: '#c4f0ff',
                    color: '#fff',
                    fontWeight: '500',
                    fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                    fontSize: '16px',
                    fontSmoothing: 'antialiased',
                    '::placeholder': {
                        color: '#87BBFD',
                    },
                },
                invalid: {
                    iconColor: '#FFC7EE',
                    color: '#FFC7EE',
                },
            },
        });
        
        // Add event listeners to buy buttons
        const buyButtons = document.querySelectorAll('.buy-button');
        buyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const username = document.getElementById('minecraft-username').value.trim();
                if (!username) {
                    showToast('Please enter your Minecraft username before purchasing.');
                    return;
                }
                
                selectedRank = this.getAttribute('data-rank');
                selectedPrice = this.getAttribute('data-price');
                
                // Update summary in modal
                document.getElementById('summary-rank').textContent = selectedRank.toUpperCase();
                document.getElementById('summary-price').textContent = (parseInt(selectedPrice) / 100).toFixed(2);
                document.getElementById('summary-username').textContent = username;
                
                // Show modal
                const modal = document.getElementById('payment-modal');
                modal.style.display = 'block';
                
                // Mount the card element if not already mounted
                if (!card.mounted) {
                    card.mount('#card-element');
                    card.mounted = true;
                }
            });
        });
        
        // Close modal when clicking the close button
        const closeModal = document.querySelector('.close-modal');
        closeModal.addEventListener('click', function() {
            document.getElementById('payment-modal').style.display = 'none';
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('payment-modal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Handle form submission
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('minecraft-username').value.trim();
            if (!username) {
                showToast('Please enter your Minecraft username.');
                return;
            }
            
            // Show processing state
            document.getElementById('payment-processing').style.display = 'block';
            document.getElementById('payment-form-container').style.display = 'none';
            
            // Create payment intent on your server
            createPaymentIntent(selectedRank, selectedPrice, username)
                .then(clientSecret => {
                    // Confirm the payment with Stripe.js
                    return stripe.confirmCardPayment(clientSecret, {
                        payment_method: {
                            card: card,
                            billing_details: {
                                name: username
                            }
                        }
                    });
                })
                .then(result => {
                    if (result.error) {
                        // Show error to your customer
                        showError(result.error.message);
                    } else {
                        // The payment succeeded!
                        handleSuccessfulPayment(username, selectedRank);
                    }
                })
                .catch(error => {
                    showError('An error occurred during payment processing. Please try again.');
                    console.error('Payment error:', error);
                });
        });
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to initialize payment system. Please try again later.');
    }
});

// Function to create a payment intent on your server
async function createPaymentIntent(rank, price, username) {
    try {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rank: rank,
                amount: price,
                username: username
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.clientSecret;
    } catch (error) {
        showError('Failed to initialize payment. Please try again.');
        console.error('Create payment intent error:', error);
        throw error;
    }
}

// Function to handle successful payment
async function handleSuccessfulPayment(username, rank) {
    try {
        // Call your server to record the successful payment
        const response = await fetch('/api/apply-rank', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                rank: rank
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            showError('Payment was successful, but there was an issue recording your purchase. Please contact support.');
            console.error('Apply rank error:', data.error);
            return;
        }
        
        // Show success message
        document.getElementById('payment-processing').style.display = 'none';
        document.getElementById('payment-success').style.display = 'block';
        
        // Reset form after 5 seconds and close modal
        setTimeout(() => {
            document.getElementById('payment-modal').style.display = 'none';
            document.getElementById('payment-success').style.display = 'none';
            document.getElementById('payment-form-container').style.display = 'block';
            document.getElementById('payment-form').reset();
        }, 5000);
    } catch (error) {
        showError('Payment was successful, but there was an issue recording your purchase. Please contact support.');
        console.error('Handle successful payment error:', error);
    }
}

// Function to show error message
function showError(message) {
    document.getElementById('payment-processing').style.display = 'none';
    document.getElementById('payment-form-container').style.display = 'block';
    
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = message;
    
    // Scroll to error message
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function to show toast notification
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Function to validate Minecraft username
function isValidMinecraftUsername(username) {
    // Minecraft usernames are 3-16 characters and can only include letters, numbers, and underscores
    const regex = /^[a-zA-Z0-9_]{3,16}$/;
    return regex.test(username);
}

// Add validation to username input
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('minecraft-username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const username = this.value.trim();
            if (username && !isValidMinecraftUsername(username)) {
                showToast('Please enter a valid Minecraft username (3-16 characters, only letters, numbers, and underscores).');
                this.focus();
            }
        });
    }
});
