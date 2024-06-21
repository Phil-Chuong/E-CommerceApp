// src/components/Products.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  return (
    <div>
      <div><h1>Welcome to my shop</h1></div>
      <h2>New Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
      <button><a href='/login'>Logout</a></button>
    </div>
  );
};

export default HomePage;
