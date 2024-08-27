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
  

  const handleLoginSuccess = async (accessToken, refreshToken, cartId, userId) => {
    console.log('Login Success - Received data:', { accessToken, refreshToken, cartId, userId });

    if (!accessToken || !refreshToken || !cartId || !userId) {
      console.error('Missing required data from server response.');
      setError('Incomplete login data received.');
      return;
    }

    // Store tokens and cartId in localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('cartId', cartId);
    localStorage.setItem('userId', userId);

    console.log('Tokens stored:', {
      accessToken: localStorage.getItem('token'),
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
    let accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    let cartId = localStorage.getItem('cartId');

    console.log('Fetching or Creating Cart - Stored tokens:', {
      accessToken: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken'),
      cartId: localStorage.getItem('cartId')
    });
  
    if (!accessToken) {
      console.error('No token found.');
      navigate('/login');
      return;
    }
  
    try {
      // Fetch the current cart
      let response = await axios.get('/cart', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      console.log('Cart response:', response.data);
  
      let cart = response.data.find(cart => cart.id === parseInt(cartId, 10)); // Ensure cartId is compared as number
      console.log('Cart object:', cart);

      // If cart is not found, create a new cart
      if (!cart) {
        console.error('Cart not found, creating a new cart.');
        response = await axios.post('/cart', {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log('New cart created:', response.data.cart);
        cart = response.data.cart;
  
      // Check if new cart has an id
      if (!cartId || !cart.id) {
        console.error('Cart is missing or has no id.');
        throw new Error('Cart data is missing.');
      }
    } else if (cart.status === 'completed') {
      // If the existing cart is completed, create a new cart
      response = await axios.post('/cart', {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
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
          accessToken = refreshResponse.data.accessToken;
          localStorage.setItem('token', accessToken);
  
          // Retry the request with the new token
          return await fetchOrCreateCart();
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          localStorage.removeItem('accessToken');
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
      const response = await axios.post('/auth/login', { email, password });
      console.log('Login response:', response.data);

      // Extract the token from the response data and store it in localStorage
      const { accessToken, refreshToken, cartId, userId} = response.data;

      console.log('Extracted Data:', { accessToken, refreshToken, cartId, userId });

      // Store tokens and cartId in localStorage
      if (accessToken && refreshToken && cartId && userId) {

      // Example function to handle further actions after successful login
        handleLoginSuccess(accessToken, refreshToken, cartId, userId); // Handle post-login actions
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

      const { accessToken, refreshToken, cartId, userId } = response.data;
      console.log('Received accessToken:', accessToken);
      console.log('Received refreshToken:', refreshToken);
      console.log('Received cartId:', cartId);
      console.log('Received userId:', userId );

      if (accessToken && refreshToken && cartId) {
        handleLoginSuccess(accessToken, refreshToken, cartId, userId);
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
          Don't have an account? <a href="https://tech-titan.onrender.com/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
