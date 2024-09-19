const { Pool } = require('pg');
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

  static async createOrder(totalPrice, cartId, userId) {
    console.log(`Create Order - userId: ${userId}, cartId: ${cartId}, totalPrice: ${totalPrice}`);

    if (!userId || !cartId || totalPrice == null) {
      console.error(`Missing parameters - userId: ${userId}, cartId: ${cartId}, totalPrice: ${totalPrice}`);
      throw new Error('Missing required parameters');
    }

    // Convert totalPrice to a numeric type
    const numericTotalPrice = parseFloat(totalPrice);
    if (isNaN(numericTotalPrice)) {
        console.error(`Invalid totalPrice - must be a number: ${totalPrice}`);
        throw new Error('Invalid totalPrice - must be a number');
    }

    try {
      const query = 'INSERT INTO orders (user_id, cart_id, "totalPrice", status) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [userId, cartId, numericTotalPrice, 'completed'];// Ensure totalPrice is numeric
      const { rows } = await pool.query(query, values);
      
      console.log(rows[0])
      return rows[0];

    } catch (error) {    
      console.error('Error creating order:', error.message); 
      throw error;
    }
  }

}

module.exports = Order;
