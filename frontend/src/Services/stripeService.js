import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Load the Stripe instance with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const stripeService = {
    initialize: () => stripePromise,

    // Function to handle payment using Stripe
    async handlePayment(totalPrice, paymentMethodId, cartId) {
        const stripe = await stripePromise;

        try {
            console.log('Attempting to create payment intent...');
            
            // Create payment intent on your backend
            const response = await axios.post('/checkout/checkout', {
                totalPrice,
                paymentMethodId,
                cartId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
                },
            });

            // Check for failed response
            if (response.status < 200 || response.status >= 300 || response.data.error) {
                console.error('Failed to create payment intent:', response.data.error);
                throw new Error(response.data.error || 'Failed to create payment intent');
            }

            // Confirm the payment intent with Stripe Elements
            const { client_secret, status, newCartId  } = response.data;// add newCartId

            // Check if payment has already been processed
            if (status === 'succeeded') {
                console.log('Payment has already been processed.');
                return { success: true , newCartId };
            }

            // Payment processing code
            if (response.data && response.data.newCartId) {
                 return { success: true, newCartId: response.data.newCartId };
            }
            
            // Confirm the payment intent with Stripe Elements
            console.log('Attempting to confirm payment with client secret:', client_secret);
            const { error } = await stripe.confirmCardPayment(client_secret, {
                payment_method: paymentMethodId,
            });

            if (error) {
                console.error('Payment confirmation failed:', error.message);
                throw new Error(error.message);
            }

            console.log('Payment successfully processed!');
            return { success: true, newCartId: response.data.newCartId }; // add newCartId 
            
        } catch (error) {
            console.error('Error processing payment:', error.message);
            return { error: error.message };
        }
    },
};

export default stripeService;
