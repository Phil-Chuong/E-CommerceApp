const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders', error);
    res.status(500).json({ error: 'Error getting orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error getting order', error);
    res.status(500).json({ error: 'Error getting order' });
  }
});

// Fetch orders by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const orders = await Order.getOrderByUser(userId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by user:', error.message);
    res.status(500).send('Server Error');
  }
});

// Route to create a new order
router.post('/orders', async (req, res) => {
  const { userId, cartId, totalPrice } = req.body;
  try {
    const newOrder = await Order.createOrder(userId, cartId, totalPrice);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
