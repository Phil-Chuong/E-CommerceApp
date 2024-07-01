// src/components/HomePage.js or any other component using useNavigate

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import images from './Logo.jpg'

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


  const limitedProducts = products.slice(0, 10); // Limit to 10 products


  return (
    <div className='homepageBody'>
      <div className='homeTitleHeader'>
        <img src={images} alt='TitleLogo' className='homeTitleLogo'/>
      </div>
      <div className='homeProductContainer'>
      <h2>Highlights 2024</h2>
        <ul className='homeProductCard'>
          {limitedProducts.map((product) => (
            <li key={product.id} className='homeProductItems'>
              <h3>{product.name}</h3>
              <img src={product.image_path} alt={product.name} />
              <p>£{product.price}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
