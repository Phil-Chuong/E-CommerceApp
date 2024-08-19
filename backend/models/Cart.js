const pool = require('../DB/db');

class Cart {
  static async getAllCart() {
    const query = 'SELECT * FROM cart';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all carts:', error.message);
      throw error;
    }
  }

  static async getCartById(cartId) {
    if (!cartId) {
      throw new Error(' ID is required');
    }
    try {
      const result = await pool.query('SELECT * FROM cart WHERE id = $1', [cartId]);
      console.log('Cart fetched by ID:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching cart:', err.message);
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
      console.error('Error fetching items by cart ID:', error.message);
      throw error;
    }
  }

  static async getCartItem(itemId) {
    const query = 'SELECT qty, cart_id, product_id FROM cart_items WHERE id = $1';
    try {
      const result = await pool.query(query, [itemId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching cart item:', error.message);
      throw error;
    }
  }
    
    
  // POST REQUEST
  static async addProductToCart(cartId, productId, quantity, userId) {
    try {
      // Fetch product details including price
      const productQuery = 'SELECT price, stock FROM products WHERE id = $1';
      const productResult = await pool.query(productQuery, [productId]);
      const product = productResult.rows[0];
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if there is enough stock
      if (product.stock < quantity) {
        return { message: 'Not enough stock available' };
      }

      // Check if the product already exists in the cart
      const existingCartItem = await pool.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );

      if (existingCartItem.rows.length > 0) {
        // If the product exists in the cart, update the quantity
        const updatedQuantity = existingCartItem.rows[0].qty + parseInt(quantity);

        // Ensure the updated quantity doesn't exceed the stock
      if (updatedQuantity > product.stock) {
        return { message: 'Not enough stock available' };
      }

        await pool.query(
          'UPDATE cart_items SET qty = $1 WHERE cart_id = $2 AND product_id = $3',
          [updatedQuantity, cartId, productId]
        );

        await pool.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [quantity, productId]
        );

        return { message: 'Product quantity updated in cart' };
      } else {
        // If the product doesn't exist in the cart, create a new entry
        const query = 'INSERT INTO cart_items (cart_id, product_id, qty, price) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [cartId, productId, quantity, product.price];
        const { rows } = await pool.query(query, values);

        // Update the stock for the product
        await pool.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [quantity, productId]
        );

        return rows[0];
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      throw error;
    }
  }


  // PUT REQUEST
  static async updateCartItem(cartItemId, quantity) {
    const query = 'UPDATE cart_items SET qty = $1 WHERE id = $2 RETURNING *';
    try {
      const result = await pool.query(query, [quantity, cartItemId]);
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


  static async decrementCartItem(cartItemId) {
  // Step 1: Fetch the cart item details
  const cartItemQuery = 'SELECT product_id, qty FROM cart_items WHERE id = $1';
  try {
    console.log(`Fetching cart item details for id: ${cartItemId}`);
    const cartItemResult = await pool.query(cartItemQuery, [cartItemId]);
    const cartItem = cartItemResult.rows[0];

    if (!cartItem) {
      console.error('Cart item not found');
      throw new Error('Cart item not found');
    }

    console.log(`Cart item details: ${JSON.stringify(cartItem)}`);

    // Step 2: Check if the quantity is 1, if so delete the item, else decrement the quantity
    if (cartItem.qty === 1) {
      console.log(`Cart item quantity is 1, deleting item and updating stock`);
      // Update the product stock
      const updateStockQuery = 'UPDATE products SET stock = stock + 1 WHERE id = $1';
      await pool.query(updateStockQuery, [cartItem.product_id]);

    //Delete the cart item
    const deleteQuery = 'DELETE FROM cart_items WHERE id = $1';
    await pool.query(deleteQuery, [cartItemId]);

    return { message: 'Cart item deleted and stock updated' };
      } else {
        console.log(`Decrementing cart item quantity`);
        // Decrement the quantity
        const decrementQuery = 'UPDATE cart_items SET qty = qty - 1 WHERE id = $1 RETURNING *';
        const result = await pool.query(decrementQuery, [cartItemId]);

        // Update the product stock
        const updateStockQuery = 'UPDATE products SET stock = stock + 1 WHERE id = $1';
        await pool.query(updateStockQuery, [cartItem.product_id]);


        console.log(`Updated cart item: ${JSON.stringify(result.rows[0])}`);
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
      throw error;
    }
  }

}

module.exports = Cart;
