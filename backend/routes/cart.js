// routes/cart.js

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');
const authService = require('../services/authService');
const { authenticateToken } = require('../services/authenticateToken');
const CheckoutService = require('../services/CheckoutService');
const Checkout = require('../models/Checkout');
const Order = require('../models/Order');
require('dotenv').config();
// const pool = require('../DB/db');

const JWT_SECRET = process.env.JWT_SECRET;

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
router.get('/cart/:id', authenticateToken, async (req, res) => {
  const cartId = parseInt(req.params.id, 10); // Ensure cartId is an integer
  console.log('Fetching cart with ID:', cartId); // Debugging log

  if (isNaN(cartId)) {
    console.error('Invalid cart ID');
    return res.status(400).json({ error: 'Invalid cart ID' });
  }

  try {
    const cart = await Cart.getCartById(cartId);
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error retrieving cart', error);
    res.status(500).json({ error: 'Error retrieving cart' });
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

// Route to get all cart items by cart ID
router.get('/cart_items/:cartId', async (req, res) => {
  const { cartId } = req.params; // Extract cartId from request parameters
  try {
    // Fetch cart items specifically for the provided cartId
    const cartItems = await Cart.getItemsByCartId(cartId); // Assuming Cart.getItemsByCartId() method takes cartId as an argument

    if (!cartItems) {
      return res.status(404).json({ error: 'Cart items not found' });
    }

    res.json(cartItems); // Send back the fetched cart items
  } catch (error) {
    console.error('Error retrieving cart items:', error);
    res.status(500).json({ error: 'Error retrieving cart items' });
  }
});


//get ACTIVE user by id
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const activeCart = await Cart.getActiveCartByUserId(userId);
    if (!activeCart) {
      return res.status(404).json({ message: 'Active cart not found' });
    }
    res.json(activeCart);
  } catch (error) {
    console.error('Error fetching active cart:', error);
    res.status(500).json({ error: 'Error fetching active cart' });
  }
});


// Create or get active cart for the user
router.post('/cart', authenticateToken, async (req, res) => {
  const cartId = req.user.cartId;
  const userId = req.user.userId;
  console.log('User ID from token:', userId, 'Cart ID:', cartId); // Debugging log

  try {
    let cart;
    
    if(cartId) {
      cart = await Cart.getCartById(cartId);
    }
    
    if (!cart) {
      cart = await Cart.createCart(userId);
    }

    res.status(200).json({ cartId: cart.id });
  } catch (error) {
    console.error('Error fetching or creating cart', error);
    res.status(500).json({ error: 'Error fetching or creating cart' });
  }
});


// Add product to cart or create cart if it doesn't exist
router.post('/cart_items', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { productId, quantity, cartId, } = req.body;

    // Check if all required fields are provided
    if (!cartId || !productId || !quantity) {
      return res.status(400).json({ error: ' cartId, productId, and quantity are required' });
    }

    // Check if cart exists, otherwise create a new cart
    let currentCartId = cartId;
    if (!currentCartId) {
      const newCart = await Cart.createCart();
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


//DELETE cart item by id
router.delete('/cart_items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Attempting to delete cart item with id: ${id}`);
    const result = await Cart.deleteCartItem(id);
    console.log(`Delete result: ${result}`);
    if (result) {
      res.status(200).json({ message: 'Cart item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Cart item not found' });
    }
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: 'Error deleting cart item' });
  }
});


// PUT route to decrement cart item quantity
router.put('/cart_items/:itemId/decrement', async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await Cart.getCartItem(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentQty = item.qty;

    if (currentQty === 1) {
      await Cart.deleteCartItem(itemId);
      return res.json({ message: 'Item removed successfully' });
    } else {
      const updatedItem = await Cart.updateCartItem(itemId, currentQty - 1);
      return res.json(updatedItem);
    }
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ error: 'Error updating item quantity' });
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