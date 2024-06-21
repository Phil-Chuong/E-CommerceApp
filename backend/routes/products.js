// routes/product.js

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authService = require('../services/authService');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAllProducts(); 
    //POSTMAN TESTING TO FETCH products DATA
    res.send(products);
  } catch (error) {
    console.error('Error retrieving products', error);
    res.status(500).json({ error: 'Error retrieving products' });
  }
});

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.getProductById(id);
    if (!products) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.send(products);
  } catch (error) {
    console.error('Error retrieving product', error);
    res.status(500).json({ error: 'Error retrieving product' });
  }
});


// Get product by Category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.getProductsByCategory(category);
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Products category not found' });
    }
    res.send(products)
  } catch (error) {
    console.error('Error retrieving products category', error);
    res.status(500).json({ error: 'Error retrieving products category' });
  }
});


module.exports = router;