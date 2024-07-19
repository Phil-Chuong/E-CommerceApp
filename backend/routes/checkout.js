require('dotenv').config();
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../services/authenticateToken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Checkout = require('../models/Checkout');

// CHECKOUT
router.post('/checkout', authenticateToken, async (req, res) => {
    // Extract values from the request body
    const { totalPrice, paymentMethodId, cartId} = req.body;

    // Check if all required fields are provided
    if (!totalPrice || !paymentMethodId || !cartId) {
        return res.status(400).send({ error: 'totalPrice, paymentMethodId and cartId are required' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100,
            currency: 'gbp',
            payment_method: paymentMethodId,
            confirmation_method: 'manual',
            confirm: true,
            return_url: 'http://localhost:3000/homePage', // Adjust the URL as per your application
        });

        console.log('Payment Intent created successfully:', paymentIntent);

        // Update the checkout status and create the order
        await Checkout.checkout(cartId, totalPrice, paymentMethodId);

        res.status(200).json({
            client_secret: paymentIntent.client_secret,
            status: paymentIntent.status
        });
        
    } catch (error) {
        console.error('Error creating payment intent:', error);
       
        // Check if the error is related to unexpected state
        if (error.type === 'StripeCardError') {
            res.status(400).send({ error: 'Payment failed due to card error' });
        } else if (error.type === 'StripeInvalidRequestError') {
            res.status(400).send({ error: 'Invalid payment request' });
        } else if (error.type === 'StripeAPIError' || error.type === 'StripeConnectionError') {
            res.status(500).send({ error: 'Internal server error' });
        } else {
            res.status(500).send({ error: error.message || 'Failed to create payment intent' });
        }
    }

});


module.exports = router;
