const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../DB/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkAuthenticated, checkNotAuthenticated } = require('../services/authService');
require('dotenv').config();
const Cart = require('../models/Cart');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Refresh token route
router.post('/refresh', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
  });
});

// Register route
router.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
      const { firstname, lastname, username, email, password } = req.body;

      // Check if the username or email already exists in the database
      const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
      if (existingUser.rows.length > 0) {
          return res.status(400).json({ error: 'Username or email already registered' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user data into the database
      const result = await pool.query(
          'INSERT INTO users (firstname, lastname, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [firstname, lastname, username, email, hashedPassword]
      );

      const newUser = result.rows[0];

      // Create a new cart for the user
      const cartResult = await Cart.createCart(newUser.id); // Assuming createCart function is defined

      // Generate JWT token with userId and cartId
      const accessToken = jwt.sign({ userId: newUser.id, cartId: cartResult.id }, JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId: newUser.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

      console.log(`User ${newUser.id} registered successfully. Token accepted.`);
      console.log(`User ${newUser.id} registered successfully. Refresh token accepted.`);

      res.status(201).json({ accessToken, refreshToken, cartId: cartResult.id });
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
  }
});


// Login route
router.post('/login', checkNotAuthenticated, async (req, res) => {
  const { email, password } = req.body;

  console.log('Login request received with:', { email, password });
   
  try {
    // Fetch user from the database
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      console.log('Invalid email or password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Invalid email or password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    
    // Check if a cart already exists for the user and if it's active
    let cartResult = await pool.query('SELECT id, status FROM cart WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.id]);
    
    console.log('Checking for existing active cart...');
    console.log('Existing cart result:', cartResult.rows);

    if (cartResult.rows.length === 0 || cartResult.rows[0].status !== 'active') {
      console.log('No active cart found or cart is inactive, creating a new cart...');

      // Create a new cart for the user if no active cart exists
      cartResult = await pool.query('INSERT INTO cart (user_id, status) VALUES ($1, $2) RETURNING id', [user.id, 'active']);
      console.log('New cart created:', cartResult.rows[0]);
    }

    const cartId = cartResult.rows[0].id;
    console.log('Using cart ID:', cartId);

    // Generate JWT token with userId
    const accessToken = jwt.sign({ userId: user.id, cartId }, JWT_SECRET, { 
      expiresIn: '1h' 
    });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { 
      expiresIn: '7d' 
    });

    console.log(`User ${user.id} logged in successfully. Tokens generated.`);

    console.log(`User ${user.id} logged in successfully. Token accepted.`);
    console.log(`User ${user.id} logged in successfully. Refresh token accepted.`);

    res.json({ accessToken, refreshToken, cartId, userId: user.id});
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});


// Logout route
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  // Validate that token is provided
  if (!token) {
    return res.status(400).json({ error: 'Token and required' });
  }

  try {
    // Implement token invalidation if required
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes for authenticated and non-authenticated users
router.get('/HomePage', checkAuthenticated, (req, res) => {
  res.render('HomePage');
});

router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});


module.exports = router;
