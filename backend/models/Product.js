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

  static async getProductsByCountry(country) {
    const query = 'SELECT * FROM products WHERE country = $1';
    try {
      const result = await pool.query(query, [country]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
