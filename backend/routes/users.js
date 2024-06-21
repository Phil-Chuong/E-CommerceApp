//Users Routes

const express = require('express');
const router = express.Router();
const User = require('../models/User');

//GET all users 
router.get('/', async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.send(users);
    } catch (error) {
      console.error('Error retrieving users', error);
      res.status(500).json({ error: 'Error retrieving users' });
    }
  });

//GET users by id
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const users = await User.getUserById(id);
      if (!users) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.send(users);
    } catch (error) {
      console.error('Error retrieving users', error);
      res.status(500).json({ error: 'Error retrieving users' });
    }
  });


module.exports = router;
