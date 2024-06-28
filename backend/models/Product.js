// models/Product.js

const pool = require('../DB/db');

class Product {
  static async getAllProducts() {
    const query = 'SELECT * FROM products';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getProductById(id) {
    const query = 'SELECT * FROM products WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getProductsByCategory(category) {
    const query = 'SELECT * FROM products WHERE category = $1';
    try {
      const result = await pool.query(query, [category]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateProductImage(id, imagePath) {
    const query = 'UPDATE products SET image_path = $1 WHERE id = $2 RETURNING *';
    try {
      const result = await pool.query(query, [imagePath, id]);
      if (result.rows.length === 0) {
        return null; // Product with given ID not found
      }
      return result.rows[0]; // Return the updated product
    } catch (error) {
      throw new Error(`Error updating product image: ${error.message}`);
    }
  }

}


module.exports = Product;
