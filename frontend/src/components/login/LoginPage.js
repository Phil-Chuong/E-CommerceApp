import React, { useState, useEffect } from 'react';
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
  const [cartItems, setCartItems] = useState([]); // State for cart items

  

  const handleLoginSuccess = async (accessToken, refreshToken, cartId) => {
    console.log('Received accessToken:', accessToken);
    console.log('Received refreshToken:', refreshToken);

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('cartId', cartId);

    try {
      const cartItems = await fetchCartItems(cartId); // Fetch and update cart items
      setCartItems(cartItems);
      // Update cart items in state or context if needed
      navigate('/HomePage');
    } catch (error) {
      console.error('Error handling login success:', error);
      setError('An error occurred while setting up your cart.');
    }
  };

  // Function to handle token refresh
  const refreshToken = async () => {
    try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await axios.post('/auth/refresh', { token: refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);

    return accessToken;
    } catch (error) {
    console.error('Error refreshing token:', error);
    throw error; // Handle error or redirect as needed
    }
  };

  const fetchCartItems = async (cartId) => {
    const token = localStorage.getItem('token');
    // let refreshToken = localStorage.getItem('refreshToken');
  
    if (!token) {
      console.error('No token found.');
      navigate('/login'); // Redirect to login page
      return;
    }
  
    try {
      const response = await axios.get('/cart/cart_items', { ///cart/cart_items
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log('Cart items:', response.data.cart_items);
      // setCartItems(response.data); // Update state with fetched cart items
      return response.data.cart_items;
    } catch (error) {
      console.error('Error fetching cart items:', error);
  
      if (error.response && error.response.status === 401) {
        console.error('Token expired or invalid, refreshing token...');
        try {
          token = await refreshToken(); // Call refreshToken function
          // Retry the request with the new token
          const response = await axios.get(`/cart/cart_items/${cartId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          console.log('Cart items:', response.data);
          setCartItems(response.data); // Update state with fetched cart items
          return response.data;
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // Handle token refresh failure
          setError('Error refreshing token. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login'); // Redirect to login page
        }
      } else {
        // Handle other errors
        throw error;
      }
    }
  };
  

  const fetchOrCreateCart = async () => {
    let accessToken = localStorage.getItem('token');
    // let refreshToken = localStorage.getItem('refreshToken');
    console.log('token', accessToken);
  
    if (!accessToken) {
      console.error('No token found.');
      // Redirect to login or handle no token scenario
      navigate('/login');
      // window.location.href = '/login';
      return;
    }
  
    try {
      const response = await axios.post('/cart/cart', {}, {
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


  useEffect(() => {
    console.log('Fetching cart items...');

    const initCart = async () => {
      try {
      const accessToken = localStorage.getItem('token');
      console.log('token:', accessToken);
      
      if (!accessToken) {
        console.error('No accessToken found in localStorage.');
        // Handle scenario where no token is found (e.g., redirect to login)
        navigate('/login'); // Redirect to login page
        // window.location.href = '/login';
        return;
      }

      // Make authenticated request using accessToken
      const response = await fetch('/cart', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching cart items');
      }
  
        // const cartId = await fetchOrCreateCart();
        // await fetchCartItems(cartId);
        const cartData = await response.json();
        console.log('Cart Data:', cartData);
        setCartItems(cartData); // Update state with fetched cart items
      } catch (error) {
        console.error('Error initializing cart:', error);
        setError('An error occurred while setting up your cart.');
        navigate('/login'); // Redirect to login page
      }
    };
  
    initCart();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { accessToken, refreshToken, cartId } = response.data;

      handleLoginSuccess(accessToken, refreshToken, cartId); // Handle post-login actions
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response ? error.response.data.error : 'An unexpected error occurred.');
    }
  };
  

  // Google Submit
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await axios.post('/auth/google-login', { token: credential });
      const { accessToken, refreshToken } = response.data;
      handleLoginSuccess(accessToken, refreshToken);
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
