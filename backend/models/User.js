// models/User.js

const pool = require('../DB/db');
const bcrypt = require('bcrypt');

class User {
  // Fetch all users
  static async getAllUsers() {
    const pool = require('../DB/db');
    const query = 'SELECT * FROM users';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all users:', error.message); // Log error details
      throw error;
    }
  }

  // // Fetch a user by ID
  // static async getUserById(userId) {
  //   const query = 'SELECT id, firstname, lastname, email, username FROM users WHERE id = $1';
  //   try {
  //     const result = await pool.query(query, [userId]);
  //     return result.rows[0];
  //   } catch (error) {
  //     console.error('Error fetching user by ID:', error.message); // Log error details
  //     throw error;
  //   }
  // }

  // Fetch a user by ID
static async getUserById(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const query = 'SELECT id, firstname, lastname, email, username FROM users WHERE id = $1';
  try {
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      throw new Error(`No user found with ID: ${userId}`);
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user by ID:', error.message); // Log error details
    throw error; 
  }
}

  // Compare hashed password
  static async comparePassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error comparing password:', error.message); // Log error details
      throw error;
    }
  }

}

module.exports = User;
