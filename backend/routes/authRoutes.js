const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport')
const { OAuth2Client } = require('google-auth-library');
const pool = require('../DB/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;


// Handle Google login
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;  // 'token' should contain the ID token
    console.log('Received token:', token); // Log the received token

    if (!token) {
      throw new Error('ID Token is missing');
    }
    
    // Verify token with Google and get user information
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log('Google ticket:', ticket); // Log the Google ticket
    const payload = ticket.getPayload();
    console.log('Google payload:', payload); // Log the payload

    const { sub, email, name } = payload;
    const userId = sub;
    const fullName = name.split(' '); // Assuming name is a full name
    const [firstname, lastname] = fullName.length > 1 ? [fullName[0], fullName.slice(1).join(' ')] : [fullName[0], null];

    // Check if user already exists in your database
    let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [userId]);

    if (userResult.rows.length === 0) {
      // If user doesn't exist, create a new user
      //const [firstname, lastname] = fullName.length > 1 ? [fullName[0], fullName.slice(1).join(' ')] : [fullName[0], null];
      const defaultPassword = await bcrypt.hash('defaultpassword', 10);

      userResult = await pool.query(
        'INSERT INTO users (username, email, google_id, firstname, lastname, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email, userId, firstname, lastname, defaultPassword]
      );
    }

    const userIdInDb = userResult.rows[0].id;

    // // Check if a cart already exists for the user
    let cartResult = await pool.query('SELECT id, status FROM cart WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userIdInDb]);
    
    if (cartResult.rows.length === 0 || cartResult.rows[0].status === 'completed') {
      // Create a new cart for the user
      cartResult = await pool.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING id', [userIdInDb]);
    }

    const cartId = cartResult.rows[0].id;

    // Generate JWT token
    const accessToken  = jwt.sign({ userId: userIdInDb }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ userId: userIdInDb }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ accessToken, refreshToken, cartId });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});


module.exports = router;
