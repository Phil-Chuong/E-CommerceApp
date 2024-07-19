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
      const result = await pool.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async createOrder(userId, cartId, totalPrice) {
    try {
      const query = 'INSERT INTO orders (user_id, cart_id, "totalPrice", status) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [userId, cartId, totalPrice, 'completed']; // Assuming 'completed' status for a new order
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

}

module.exports = Order;
