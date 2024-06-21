// models/User.js

const pool = require('../DB/db');
const bcrypt = require('bcrypt');

class User {
    
  static async getAllUsers() {
    const pool = require('../DB/db');
    const query = 'SELECT * FROM users';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
