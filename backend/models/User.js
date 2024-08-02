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

  // Fetch a user by ID
static async getUserById(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
   // Ensure userId is a valid integer if your database expects an integer
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0]; // Assuming you expect a single user object
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
