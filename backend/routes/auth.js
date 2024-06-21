const express = require('express');
const router = express.Router();
const passport = require('passport');
const authService = require('../services/authService');
const pool = require('../DB/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post('/register', authService.checkNotAuthenticated, async (req, res) => {
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

router.post('/login', async (req, res) => {
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

// Logout
router.post('/logout', (req, res) => {
  req.logOut(() => {
    res.redirect('/login');
  });
});

// Handle DELETE request for logout
router.delete('/logout', (req, res) => {
  req.logOut(() => {
    res.redirect('/login');
  });
});

module.exports = router;
