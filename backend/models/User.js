// models/User.js
const pool = require('../DB/db');
const bcrypt = require('bcrypt');

// Fetch all users
class User {
  static async getAllUsers() {
    const query = 'SELECT * FROM users';
    try {
      console.log('Executing query:', query);
      const result = await pool.query(query);
      console.log('Query result:', result.rows);
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
  
  try {
   // Ensure userId is a valid integer if your database expects an integer
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log('User fetched by ID:', result.rows[0]);
    return result.rows[0]; // Assuming you expect a single user object
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
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
