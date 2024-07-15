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
  // const [cartItems, setCartItems] = useState([]); // State for cart items

  

  const handleLoginSuccess = async (accessToken, refreshToken, cartId) => {
    console.log('Received accessToken:', accessToken);
    console.log('Received refreshToken:', refreshToken);
    console.log('Received cartId:', cartId);

    if (!accessToken || !refreshToken) {
      throw new Error('Invalid token');
    }

    // Store tokens and cartId in localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('cartId', cartId);

    try {
      await fetchOrCreateCart(); // Fetch and update cart items
      // setCartItems(cartItems);
      // Update cart items in state or context if needed
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
  };


  const fetchOrCreateCart = async () => {
    let accessToken = localStorage.getItem('token');
    let refreshToken = localStorage.getItem('refreshToken');
    console.log('token', accessToken);
  
    if (accessToken || refreshToken) {
      console.error('No token found.');
      // Redirect to login or handle no token scenario
      navigate('/login');
      // window.location.href = '/login';
      return;
    }
  
    try {
      const response = await axios.post('/cart/cart/', {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      console.log('Cart response:', response.data);
  
      const cartId = response.data.cartId;
      localStorage.setItem('cartId', cartId);
      return cartId;
    } catch (error) {
      console.error('Error fetching or creating cart:', error);
  
      if (error.response && error.response.status === 401) {
        console.error('Token expired or invalid, refreshing token...');
        try {
          const refreshResponse = await axios.post('/auth/refresh', { token: localStorage.getItem('refreshToken') });
          accessToken = refreshResponse.data.accessToken;
          localStorage.setItem('token', accessToken);
  
          // Retry the request with the new token
          const response = await axios.post('/cart/cart', {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
  
          console.log('Cart response:', response.data);
  
          const cartId = response.data.cartId;
          localStorage.setItem('cartId', cartId);
          return cartId;
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          // window.location.href = '/login';
        }
      } else {
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
      const { token } = response.data;
      localStorage.setItem('token', token); // Store the token in localStorage

       // If your server responds with additional data like accessToken, refreshToken, and cartId
      const { accessToken, refreshToken, cartId } = response.data;

      // Example function to handle further actions after successful login
      handleLoginSuccess(accessToken, refreshToken, cartId); // Handle post-login actions
    
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
      
      const response = await axios.post('/auth/google-login', { token: credential });
      console.log('Backend response:', response.data); // Log the backend response

      const { accessToken, refreshToken, cartId } = response.data;
      console.log('Received accessToken:', accessToken);
      console.log('Received refreshToken:', refreshToken);
      console.log('Received cartId:', cartId);
      
       // Store tokens and cartId in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('cartId', cartId);

      handleLoginSuccess(accessToken, refreshToken, cartId);
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
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
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
