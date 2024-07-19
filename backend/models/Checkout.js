const pool = require('../DB/db');
const Cart = require('./Cart');

class Checkout {

  static async checkout(cartId) {
    try {
        console.log('Fetching cart with ID:', cartId);
        const cart = await Cart.getCartById(cartId);

        if (!cart) {
          console.log('Cart not found');
            throw new Error('Cart not found');
        }

        if (cart.status === 'completed') {
          console.log('Cart already completed');
            throw new Error('Cart already completed');
        }

        console.log('Proceeding with payment intent creation');
        // Proceed with payment intent creation and other checkout logic...
    
    } catch (error) {
        console.error('Error during checkout:', error.message);
        throw error;
    }
  }

  static async updateStatus(cartId, status) {
    try {
      // Use parameterized queries to prevent SQL injection
      const result = await pool.query('UPDATE cart SET status = $1 WHERE id = $2 RETURNING *', [status, cartId]);
  
      // Check if any rows were updated
      if (result.rowCount === 0) {
        throw new Error('Failed to update checkout status');
      }
  
      console.log('Checkout status updated successfully');
    } catch (err) {
      console.error('Error updating checkout status:', err.message);
      throw err;
    }
  }
  

  static async clearCartItems(cartId) {
    try {
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      console.log('Cart items cleared for cartId:', cartId);
    } catch (err) {
      console.error('Error clearing cart items:', err);
      throw err;
    }
  }

}

module.exports = Checkout;
