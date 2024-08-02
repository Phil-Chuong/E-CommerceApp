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
    console.log(`Create Order - userId: ${userId}, cartId: ${cartId}, totalPrice: ${totalPrice}`);
    
    if (!userId || !cartId || !totalPrice) {
      console.error(`Missing parameters - userId: ${userId}, cartId: ${cartId}, totalPrice: ${totalPrice}`);
      throw new Error('Missing required parameters');
    }
    
    try {

      const query = 'INSERT INTO orders (user_id, cart_id, "totalPrice", status) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [userId, cartId, totalPrice, 'completed']; // Ensure totalPrice is numeric
      const { rows } = await pool.query(query, values);

      console.log(rows[0])
      return rows[0];

    } catch (error) {
      console.error('Error creating order:', error.message); // Log the error message
      throw error;
    }
  }

}

module.exports = Order;
