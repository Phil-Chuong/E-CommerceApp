// models/Cart.js

const pool = require('../DB/db');

class Cart {
  static async getCartById(cartId) {
    const query = 'SELECT * FROM cart WHERE id = $1';
    try {
      const result = await pool.query(query, [cartId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async createCart(userId) {
    const query = 'INSERT INTO cart (user_id) VALUES ($1) RETURNING *';
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getCartByUserId(userId) {
    const query = 'SELECT * FROM cart WHERE user_id = $1';
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getItemsByCartId(cartId) {
    const query = 'SELECT * FROM cart_items WHERE cart_id = $1';
    try {
      const result = await pool.query(query, [cartId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async addProductToCart(cartId, productId, quantity) {
    try {
      // Fetch product details including price
      const productQuery = 'SELECT price FROM products WHERE id = $1';
      const productResult = await pool.query(productQuery, [productId]);
      const product = productResult.rows[0];
  
      // Check if the product already exists in the cart
      const existingCartItem = await pool.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );
  
      if (existingCartItem.rows.length > 0) {
        // If the product exists in the cart, update the quantity
        const updatedQuantity = existingCartItem.rows[0].qty + parseInt(quantity);
        await pool.query(
          'UPDATE cart_items SET qty = $1 WHERE cart_id = $2 AND product_id = $3',
          [updatedQuantity, cartId, productId]
        );
        return { message: 'Product quantity updated in cart' };
      } else {
        // If the product doesn't exist in the cart, create a new entry
        const query = 'INSERT INTO cart_items (cart_id, product_id, qty, price) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [cartId, productId, quantity, product.price];
        const { rows } = await pool.query(query, values);
        return rows[0];
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateCartItem(cartId, productId, quantity) {
    const query = 'UPDATE cart_items SET qty = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *';
    try {
      const result = await pool.query(query, [quantity, cartId, productId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteCart(cartId) {
    try {
      // Delete cart items first
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      console.log('Cart items removed');
      // Then delete the cart
      const result = await pool.query('DELETE FROM cart WHERE id = $1', [cartId]);
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }

  static async deleteCartItem(cartItemId) {
    const query = 'DELETE FROM cart_items WHERE id = $1';
    try {
      const result = await pool.query(query, [cartItemId]);
      return result.rowCount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cart;
