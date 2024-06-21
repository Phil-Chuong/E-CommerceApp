const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../DB/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;
    const userId = sub;
    const fullName = name.split(' '); // Assuming name is a full name

    // Check if user already exists in your database
    let user = await pool.query('SELECT * FROM users WHERE google_id = $1', [userId]);

    if (user.rows.length === 0) {
      // If user doesn't exist, create a new user
      const [firstname, lastname] = fullName.length > 1 ? [fullName[0], fullName.slice(1).join(' ')] : [fullName[0], null];
      const defaultPassword = await bcrypt.hash('defaultpassword', 10);

      user = await pool.query(
        'INSERT INTO users (username, email, google_id, firstname, lastname, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email, userId, firstname, lastname, defaultPassword]
      );
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
