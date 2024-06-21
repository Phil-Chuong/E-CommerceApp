const pool = require('../DB/db');

class Order {
  static async getAllOrders() {
    try {
      const result = await pool.query('SELECT * FROM orders');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getOrderById(orderId) {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getOrderByUser(userId) {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE user.id = $1', [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async createOrder(cartId) {
    try {
      const query = 'INSERT INTO orders (cart_id) VALUES ($1) RETURNING *';
      const values = [cartId];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
