//Users Routes

const express = require('express');
const router = express.Router();
const User = require('../models/User');

const { authenticateToken } = require('../services/authenticateToken');

//GET all users 
router.get('/', authenticateToken, async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.send(users);
    } catch (error) {
      console.error('Error retrieving users', error);
      res.status(500).json({ error: 'Error retrieving users' });
    }
  });



//GET users by id
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const userId = req.params.id;
    const users = await User.getUserById(userId);

    if (!users) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users', error);
    res.status(500).send({error: 'Error getting user'});
  }
});


module.exports = router;
