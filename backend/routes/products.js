const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

const imageURL = `https://techtitan.onrender.com`;

// Set storage engine
const storage = multer.diskStorage({
  destination: `./${imageURL}/uploads`,
  filename: function (req, file, cb) {
    const originalname = path.basename(file.originalname); // Ensure original name is preserved
    cb(null, originalname.split(' ').join('-')); // Replace spaces with hyphens
  }
});


// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');


// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Upload endpoint
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err);
    }
    if (!req.file) {
      return errorResponse(res, 400, 'No file selected!');
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const productId = req.body.productId;
    try {
      await Product.updateProductImage(productId, imagePath);
      successResponse(res, 'File uploaded and product image path updated', { filePath: imagePath });
    } catch (error) {
      console.error('Error updating product image path', error);
      errorResponse(res, 500, 'Failed to update product image path');
    }
  });
});


// Update product endpoint to add image path to an existing product
router.put('/:id/image', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err });
    }

    try {
      console.log('Request Headers:', req.headers);
      console.log('Request Body:', req.body);
      console.log('Request File:', req.file);

      if (!req.file) {
        return res.status(400).json({ error: 'No file selected!' });
      }

      const { id } = req.params;
      const imagePath = `/uploads/${req.file.filename}`;

      // Update the product in the database with the new image path
      const updatedProduct = await Product.updateProductImage(id, imagePath);

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        message: 'Product image updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product image', error);
      res.status(500).json({ error: 'Failed to update product image' });
    }
  });
});

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


// Example response format for success
const successResponse = (res, message, data) => {
  res.status(200).json({ message, data });
};

// Example response format for error
const errorResponse = (res, status, message) => {
  res.status(status).json({ error: message });
};

// Get product by id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id); // Convert id to integer
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Product ID must be a number' });
    }
    
    const product = await Product.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
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
      return errorResponse(res, 404, 'Products category not found');
    }
    successResponse(res, 'Products retrieved successfully', products);
  } catch (error) {
    console.error('Error retrieving products category', error);
    errorResponse(res, 500, 'Error retrieving products category');
  }
});


module.exports = router;