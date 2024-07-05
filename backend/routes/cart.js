// routes/cart.js

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authService = require('../services/authService');
const authenticateToken = require('../services/authenticateToken');
const CheckoutService = require('../services/CheckoutService');
const Checkout = require('../models/Checkout');
const Order = require('../models/Order');

// Get all cart
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.getAllCart();
    res.send(cart);
  } catch (error) {
    console.error('Error retrieving users', error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

// Get cart by id
router.get('/cart/:cartId', async (req, res) => {
  const { cartId } = req.params;
  try {
    const cart = await Cart.getCartById(cartId);
    res.json(cart);
  } catch (error) {
    console.error('Error retrieving cart', error);
    res.status(500).json({ error: 'Error retrieving cart' });
  }
});

// Get cart by user ID
router.get('/user/:userId/cart', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const cart = await getCartByUserId(userId);
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error retrieving cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new cart
router.post('/cart', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }
    const cart = await Cart.createCart(user_id);
    res.status(201).json(cart);
  } catch (error) {
    console.error('Error creating cart', error);
    res.status(500).json({ error: 'Error creating cart' });
  }
});

//get all cart_items
router.get('/cart_items', async (req, res) => {
  try {
    const cartItems = await Cart.getAllCartItems();
    res.send(cartItems);
  } catch (error) {
    console.error('Error retrieving users', error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

// Add product to cart or create cart if it doesn't exist
router.post('/cart_items', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { productId, quantity, cartId } = req.body;

    // Check if all required fields are provided
    if (!cartId || !productId || !quantity) {
      return res.status(400).json({ error: ' cartId, productId, and quantity are required' });
    }

    // Check if cart exists, otherwise create a new cart
    let currentCartId = cartId;
    if (!currentCartId) {
      const newCart = await Cart.createCart(user_id);
      currentCartId = newCart.id;
    }

    // Add product to cart
    const addedProduct = await Cart.addProductToCart(currentCartId, productId, quantity);
    res.status(200).json(addedProduct);
  } catch (error) {
    console.error('Error adding product to cart', error);
    res.status(500).json({ error: 'Error adding product to cart' });
  }
});


// // POST route to add an item to the cart
// router.post('/cart_items', authenticateToken, async (req, res) => {
//   const { cartId, productId, quantity } = req.body;

//   try {
//     const result = await addProductToCart(cartId, productId, quantity);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error adding item to cart:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

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