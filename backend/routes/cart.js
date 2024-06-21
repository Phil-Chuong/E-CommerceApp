// routes/cart.js

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authService = require('../services/authService');
const CheckoutService = require('../services/CheckoutService');
const Checkout = require('../models/Checkout');
const Order = require('../models/Order');

// Get cart by id
router.get('/:cartId', async (req, res) => {
  const { cartId } = req.params;
  try {
    const cart = await Cart.getCartById(cartId);
    res.json(cart);
  } catch (error) {
    console.error('Error retrieving cart', error);
    res.status(500).json({ error: 'Error retrieving cart' });
  }
});

// Create a new cart
router.post('/', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id ) {
      return res.status(400).json({ message: 'user_id is required' });
    }
    const cart = await Cart.createCart(user_id);
    res.status(201).json(cart);
  } catch (error) {
    console.error('Error creating cart', error);
    res.status(500).json({ error: 'Error creating cart' });
  }
});

// Add product to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity, cartId } = req.body; // Extract cartId from request body

    // Check if cartId is provided
    if (!cartId) {
      return res.status(400).json({ error: 'cartId is required' });
    }

    // Add product to cart
    const addedProduct = await Cart.addProductToCart(cartId, productId, quantity);
    res.status(200).json(addedProduct);
  } catch (error) {
    console.error('Error adding product to cart', error);
    res.status(500).json({ error: 'Error adding product to cart' });
  }
});

// Update product in cart
router.put('/:cartId/cartItems/:productId', async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;
  try {
    const cartItem = await Cart.updateCartItem(cartId, productId, quantity);
    res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error updating cart item', error);
    res.status(500).json({ error: 'Error updating cart item' });
  }
});

// Delete cart by id
router.delete('/:cartId', async (req, res) => {
  const { cartId } = req.params;
  try {
    const result = await Cart.deleteCart(cartId);
    res.status(204).json({ message: 'Cart deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart', error);
    res.status(500).json({ error: 'Error deleting cart' });
  }
});

// Delete cart item id
router.delete('/cartItems/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;
  try {
    const result = await Cart.deleteCartItem(cartItemId);
    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item', error);
    res.status(500).json({ error: 'Error deleting cart item' });
  }
});


// CHECKOUT
router.post('/:cartId/checkout', async (req, res) => {
  try {
    const { cartId } = req.params;

    // Fetch cart items from the database
    const cartItems = await Cart.getItemsByCartId(cartId);

    // Calculate total quantity and price using CheckoutService
    const { totalQuantity, totalPrice } = CheckoutService.calculateTotal(cartItems);

    // Validate the cart
    const cart = await Cart.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Process the payment (Assuming all charges succeed)
    // You can add payment processing logic here

    // Get user_id from the cart
    const userId = cart.user_id;

    // Create an order
    const order = await Checkout.checkout(cartId, totalPrice, userId);

    // Return response with total quantity, total price, and checkout result
    res.status(200).json({ totalQuantity, totalPrice, cartId, checkoutResult: order });
  } catch (error) {
    console.error('Error checking out', error);
    res.status(500).json({ error: 'Error checking out' });
  }
});

module.exports = router;