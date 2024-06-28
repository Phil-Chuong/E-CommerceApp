// src/components/HomePage.js or any other component using useNavigate

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, [navigate]);


  return (
    <div className='homepageBody'>
      <div className='title'><h1>Welcome to my shop</h1></div>
      <h2>New Products</h2>
      <ul>
        {/* {products.map(product => (
          <li key={product.id}>{product.name} £{product.price}</li>
        ))} */}

        {products.map((product) => (
            <div key={product.id}>
                <h3>{product.name}</h3>
                <img src={product.image_path} alt={product.name} width="100" />
            </div>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
