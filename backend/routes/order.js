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
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
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

module.exports = router;
