import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';
import Logo from '../images/Logo.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  

  const handleLoginSuccess = async (token, refreshToken, cartId, userId) => {
    console.log('Login Success - Received data:', { token, refreshToken, cartId, userId });

    if (!token || !refreshToken || !cartId || !userId) {
      console.error('Missing required data from server response.');
      setError('Incomplete login data received.');
      return;
    }

    // Store tokens and cartId in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('cartId', cartId);
    localStorage.setItem('userId', userId);

    console.log('Tokens stored:', {
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      cartId: localStorage.getItem('cartId'),
      userId: localStorage.getItem('userId')
    });
    

    try {
      await fetchOrCreateCart(); // Fetch and update cart items
      navigate('/HomePage');
    } catch (error) {
      console.error('Error handling login success:', error);
      if (error.response) {
        console.error('Response Data:', error.response.data); // Log backend response data
      setError(error.response.data.message || 'Failed to create cart.');
    } else {
      setError('An error occurred while setting up your cart.');
    }
    }

    // console.log('Tokens after login:', {
    //   token: localStorage.getItem('token'),
    //   refreshToken: localStorage.getItem('refreshToken'),
    // });
  };

  const fetchOrCreateCart = async () => {
    let token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    let cartId = localStorage.getItem('cartId');

    console.log('Fetching or Creating Cart - Stored tokens:', {
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      cartId: localStorage.getItem('cartId')
    });

    if (!token) {
      console.error('No token found.');
      navigate('/login');
      return;
    }
  
    try {
      // Fetch the current cart
      let response = await axios.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Cart response:', response.data);
  
      let cart = response.data[0]; // Assuming response.data.cart contains the cart object
      console.log('Cart object:', cart); // Log the cart object to verify its structure
  
      // Check if cart is defined and has the necessary properties
      if (!cart || !cart.id) {
        console.error('Cart is missing or has no id.');
        throw new Error('Cart data is missing.');
      }
  
      // If the cart exists and is completed, create a new cart
      if (cart.status === 'completed') {
        response = await axios.post('/cart', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        console.log('New cart created:', response.data.cart);
        cart = response.data.cart;
  
        // Check if new cart has an id
        if (!cart || !cart.id) {
          console.error('New cart is missing or has no id.');
          throw new Error('New cart data is missing.');
        }
      }
      
      // Update local storage with the cart ID
      localStorage.setItem('cartId', cart.id);
      return cart.id;
    } catch (error) {
      console.error('Error fetching or creating cart:', error.message);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        setError(error.response.data.message || 'Failed to fetch or create cart.');
      } else {
        setError('An error occurred while fetching or creating the cart.');
      }
      
      // Token refresh logic
      if (error.response?.status === 401) {  // Token expired or invalid
        try {
          console.error('Token expired or invalid, refreshing token...');
          const refreshResponse = await axios.post('/auth/refresh', { token: refreshToken });
          token = refreshResponse.data.token;
          localStorage.setItem('token', token);
  
          // Retry the request with the new token
          return await fetchOrCreateCart();
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        }
      } else {
        console.error('Error fetching or creating cart:', error.message);
        throw error;
      }
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send a POST request to the server with user credentials
      const response = await axios.post('https://techtitan.onrender.com/auth/login', { email, password });
      console.log('Login response:', response.data);

      // Extract the token from the response data and store it in localStorage
      const { token, refreshToken, cartId, userId} = response.data;

      console.log('Extracted Data:', { token, refreshToken, cartId, userId });

      // Store tokens and cartId in localStorage
      if (token && refreshToken && cartId && userId) {

      // Example function to handle further actions after successful login
        handleLoginSuccess(token, refreshToken, cartId, userId); // Handle post-login actions
      } else {
        throw new Error('Missing data from server response');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific errors from the server response
      if (error.response) {
        setError(error.response.data.error || 'An unexpected error occurred.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };
  

  // Google Submit
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('Credential response:', credentialResponse); // Log the full credential response
      const { credential } = credentialResponse;

      if (!credential) {
        throw new Error('Missing credential');
      }
  
      // Sending token to backend
      const response = await axios.post('/authRoutes/google-login', { token: credential });
      console.log('Backend response:', response.data); // Log the backend response

      const { token, refreshToken, cartId, userId } = response.data;
      console.log('Received token:', token);
      console.log('Received refreshToken:', refreshToken);
      console.log('Received cartId:', cartId);
      console.log('Received userId:', userId );

      if (token && refreshToken && cartId) {
        handleLoginSuccess(token, refreshToken, cartId, userId);
      } else {
        setError('Missing data from server response');
      }
    } catch (error) {
      setError('Google login failed.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed.');
  };

  return (
    <div className='loginBody'>
      <form className='loginForm' onSubmit={handleSubmit}>
        <img className='logo' src={Logo} alt='companyLogo' />
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <br />
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <br />
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
        <br />
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
