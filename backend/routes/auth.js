const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../DB/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkAuthenticated, checkNotAuthenticated } = require('../services/authService');
require('dotenv').config();



const JWT_SECRET = process.env.JWT_SECRET;

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

      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error registering user' });
  }
});

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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle login
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/HomePage', // Redirect to home page on successful login
  failureRedirect: '/login',    // Redirect back to login page on failure
  failureFlash: true            // Enable flash messages for authentication failures
}));

// Logout route
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
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
