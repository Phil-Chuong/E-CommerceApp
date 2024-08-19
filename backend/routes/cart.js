// routes/cart.js
require('dotenv').config();

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authService = require('../services/authService');
const { authenticateToken } = require('../services/authenticateToken');

const JWT_SECRET = process.env.JWT_SECRET;

// Get all cart
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.getAllCart();
    res.json(cart);
  } catch (error) {
    console.error('Error retrieving cart', error.message);
    res.status(500).json({ error: 'Error retrieving cart' });
  }
});

// Get cart by id
router.get('/:id', async (req, res) => {
  const cartId = parseInt(req.params.id, 10); // Ensure cartId is an integer
  console.log('Fetching cart with ID:', cartId); // Debugging log

  if (isNaN(cartId)) {
    console.error('Invalid cart ID');
    return res.status(400).json({ error: 'Invalid cart ID' });
  }

  try {
    const cart = await Cart.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    console.log('Fetched cart:', cart);
    res.json(cart);
  } catch (error) {
    console.error('Error retrieving cart', error.message);
    res.status(500).json({ error: 'Error retrieving cart' });
  }
});

//get all cart_items
router.get('/cart_items', async (req, res) => {
  try {
    const cartItems = await Cart.getAllCartItems();
    res.json(cartItems);
  } catch (error) {
    console.error('Error retrieving cart items:', error.message);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

// Route to get all cart items by cart ID
router.get('/cart_items/:cartId', async (req, res) => {
  const cartId = parseInt(req.params.cartId, 10);

  if (isNaN(cartId)) {
      return res.status(400).json({ error: 'Invalid cartId' });
  }

  try {
      const items = await Cart.getItemsByCartId(cartId);
      res.json(items);
  } catch (error) {
      console.error('Error retrieving cart items:', error.message);
      res.status(500).json({ error: 'Failed to retrieve cart items' });
  }
});


//get ACTIVE cart user by id
router.get('/active/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const activeCart = await Cart.getActiveCartByUserId(userId);

    if (!activeCart) {
      return res.status(404).json({ message: 'Active cart not found' });
    }
    res.json(activeCart);
  } catch (error) {
    console.error('Error fetching active cart:', error.message);
    res.status(500).json({ error: 'Error fetching active cart' });
  }
});


// Create or get active cart for the user
router.post('/cart', async (req, res) => {
  const {cartId} = req.cartId;
  const userId = req.userId;
  console.log('User ID from token:', userId, 'Cart ID:', cartId); // Debugging log

  if (!userId) {
    return res.status(400).json({ error: 'User ID not found' });
  }

  try {
    let cart = await Cart.getActiveCartByUserId(userId);
    
    if (!cart) {
      cart = await Cart.createCart(userId);
    }

    res.status(200).json({ cartId: cart.id });
  } catch (error) {
    console.error('Error fetching or creating cart', error.message);
    res.status(500).json({ error: 'Error fetching or creating cart' });
  }
});


// Add product to cart or create cart if it doesn't exist
router.post('/cart_items', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { productId, quantity, cartId } = req.body;
    const userId = req.userId; // Ensure you get the userId from the authenticated user context

    console.log('User ID:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request' });
  }

    // Check if all required fields are provided
    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    // Check if cart exists, otherwise create a new cart
    let currentCartId = cartId;

    if (!currentCartId) {
      const newCart = await Cart.createCart(userId);
      currentCartId = newCart.id;
    }

    // Add product to cart
    const addedProduct = await Cart.addProductToCart(currentCartId, productId, quantity, userId);
    res.status(200).json(addedProduct);

  } catch (error) {
    console.error('Error adding product to cart', error.message);
    res.status(500).json({ error: 'Error adding product to cart' });
  }
});


// Update product in cart
router.put('/:cartId/cartItems/:productId', async (req, res) => {
  const cartId = parseInt(req.params.cartId, 10);
  const productId = parseInt(req.params.productId, 10);
  const { quantity } = req.body;

  if (isNaN(cartId) || isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid cart ID or product ID' });
  }

  try {
    const cartItem = await Cart.updateCartItem(cartId, productId, quantity);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error updating cart item', error.message);
    res.status(500).json({ error: 'Error updating cart item' });
  }
});


// Decrement cart item quantity or delete if quantity is 1
router.put('/cart_items/:itemId/decrement', async (req, res) => {
  const { itemId } = req.params;

  console.log(`Received request to decrement cart item with id: ${itemId}`);

  try {
    const result = await Cart.decrementCartItem(itemId);

    if (result === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    console.log(`Decrement result: ${JSON.stringify(result)}`);
    res.status(200).json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error decrementing cart item', error.message);
    res.status(500).json({ error: 'Error decrementing cart item' });
  }
});


// Delete cart by id
router.delete('/:cartId', authenticateToken, async (req, res) => {
  const { cartId } = req.params;
  try {
    const result = await Cart.deleteCart(cartId);
    res.status(204).json({ message: 'Cart deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart', error);
    res.status(500).json({ error: 'Error deleting cart' });
  }
});


// Delete cart item and update product stock
router.delete('/cart_items/:itemId', authenticateToken, async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await Cart.decrementCartItem(itemId);
    if (result === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.status(200).json({ message: 'Cart item deleted and stock updated' });
  } catch (error) {
    console.error('Error deleting cart item', error);
    res.status(500).json({ error: 'Error deleting cart item' });
  }
});


module.exports = router;