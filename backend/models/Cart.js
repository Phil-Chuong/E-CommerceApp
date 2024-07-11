const pool = require('../DB/db');

class Cart {
  static async getAllCart() {
    // const pool = require('../DB/db');
    const query = 'SELECT * FROM cart';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

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
      try {
        console.log(`Creating cart for user id: ${userId}`);
        const result = await pool.query(
          'INSERT INTO cart (user_id, status) VALUES ($1, $2) RETURNING *',
          [userId, 'active']
        );
        return result.rows[0];
      } catch (error) {
        console.error('Error creating cart for user:', error);
        throw new Error('Error creating cart');
      }
  };

  static async getActiveCartByUserId(userId) {
    const query = 'SELECT * FROM cart WHERE user_id = $1 AND status = $2';
    try {
      const result = await pool.query(query, [userId, 'active']);
      return result.rows[0];
    } catch (error) {
      console.error('Error retrieving active cart:', error);
      throw error;
    }
  }

  //get all cart_items
  static async getAllCartItems() {
    const query = 'SELECT * FROM cart_items';
    try {
      const result = await pool.query(query);
      return result.rows;
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

  // POST REQUEST
  static async addProductToCart(cartId, productId, quantity) {
    try {
      // Fetch product details including price
      const productQuery = 'SELECT price FROM products WHERE id = $1';
      const productResult = await pool.query(productQuery, [productId]);
      const product = productResult.rows[0];
      
      if (!product) {
        throw new Error('Product not found');
      }

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
      console.error('Error adding product to cart:', error);
      throw error;
    }
  }

  // PUT REQUEST
  static async updateCartItem(cartId, productId, quantity) {
    const query = 'UPDATE cart_items SET qty = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *';
    try {
      const result = await pool.query(query, [quantity, cartId, productId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // DELETE REQUEST
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
