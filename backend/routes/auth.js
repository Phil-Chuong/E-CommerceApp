const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../DB/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkAuthenticated, checkNotAuthenticated } = require('../services/authService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Function to create a new cart for the user
const createCart = async (userId) => {
  try {
    console.log(`Creating cart for user id: ${userId}`);
    const result = await pool.query(
      'INSERT INTO cart (user_id, status) VALUES ($1, $2) RETURNING *',
      [userId, 'active']
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating cart for user:', error);
    throw new Error('Error creating cart');
  }
};

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

    const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '15m' });
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
      const cartResult = await createCart(newUser.id); // Assuming createCart function is defined

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

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the user has a cart, if not, create one
    const cartResult = await pool.query('SELECT * FROM cart WHERE user_id = $1', [user.id]);
    const cartId = cartResult.rows.length > 0 ? cartResult.rows[0].id : null;
    // if (cartResult.rows.length === 0) {
    //   await createCart(user.id); // Create cart if not already exists
    // }

    // Generate JWT token with userId
    const accessToken = jwt.sign({ userId: user.id, cartId }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log(`User ${user.id} logged in successfully. Token accepted.`);
    console.log(`User ${user.id} logged in successfully. Refresh token accepted.`);


    res.json({ accessToken, refreshToken, cartId });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    // Remove all cart items associated with cartId
    // await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    // Optionally, implement token invalidation logic
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Redirect Route if not authenticated
router.get('/HomePage', checkAuthenticated, (req, res) => {
  res.render('HomePage');
});

router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});


module.exports = router;
