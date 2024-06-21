// Checkout.js
const pool = require('../DB/db');

class Checkout {
  static async checkout(cartId, totalPrice, userId) {
    try {
      const query = 'UPDATE cart SET status = $1 WHERE id = $2 RETURNING *';
      const values = ['checked_out', cartId];
      await pool.query(query, values);

      const orderQuery = 'INSERT INTO orders (user_id, cart_id, "totalPrice", status) VALUES ($1, $2, $3, $4) RETURNING *';
      const orderValues = [userId, cartId, totalPrice, 'checked_out'];
      const { rows } = await pool.query(orderQuery, orderValues);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Checkout;






