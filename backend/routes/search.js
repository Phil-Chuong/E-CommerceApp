const express = require('express');
const router = express.Router();
const pool = require('../DB/db');

// Route to handle search queries
router.get('/search', async (req, res) => {
  const searchQuery = req.query.query;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Only use the first letter for the search
  const firstLetter = searchQuery.charAt(0);

  try {
    const results = await pool.query(
      'SELECT id, name, image_path, price FROM products WHERE name ILIKE $1 ORDER BY name ASC',
      [`${firstLetter}%`]  // Match only names starting with the first letter
    );
    res.json(results.rows);
  } catch (error) {
    console.error('Error executing search query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
