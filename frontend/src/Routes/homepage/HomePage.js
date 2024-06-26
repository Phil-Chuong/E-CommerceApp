// src/components/HomePage.js or any other component using useNavigate

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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


  // const handleLogout = async () => {
  //   const token = localStorage.getItem('token');
  //   try {
  //     await axios.post('/auth/logout', { token });  // Ensure this URL matches your backend route
  //     localStorage.removeItem('token'); // Clear authentication token
  //     navigate('/login'); // Redirect to login page
  //   } catch (error) {
  //     console.error('Error during logout:', error);
  //   }
  // };

  return (
    <div>
      <div><h1>Welcome to my shop</h1></div>
      <h2>New Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
