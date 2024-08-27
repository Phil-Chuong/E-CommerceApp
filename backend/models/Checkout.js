const pool = require('../DB/db');
const Cart = require('./Cart');
const Order = require('./Order');

class Checkout {

  static async checkout(cartId, userId, totalPrice) {
  
  const client = await pool.connect();
    try {
      await client.query('BEGIN');

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
        
        await Checkout.updateStatus(cartId, 'completed', userId, totalPrice); // Adjust status as needed
        await Order.createOrder(userId, cartId, parseFloat(totalPrice));
        //await Checkout.clearCartItems(cartId);

        await client.query('COMMIT');
        console.log('Checkout completed successfully');

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during checkout:', error.message);
        throw error;
      } finally {
        client.release();
    }
  }

  static async updateStatus(client, cartId, status, userId, totalPrice) {
    console.log(`Update Status - cartId: ${cartId}, status: ${status}, userId: ${userId}, totalPrice: ${totalPrice}`);
    try {

      // Use parameterized queries to prevent SQL injection
      console.log(cartId);
      const result = await client.query(
        'UPDATE cart SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', 
        [status, cartId]
      );
  
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

  static async clearCartItems(client, cartId) {
    try {

      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

      console.log('Cart items cleared for cartId:', cartId);
    } catch (err) {
      console.error('Error clearing cart items:', err);
      throw err;
    }
  }


}

module.exports = Checkout;
