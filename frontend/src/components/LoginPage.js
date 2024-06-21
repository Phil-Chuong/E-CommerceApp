import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
// import jwtDecode from 'jwt-decode';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token } = response.data;
      // Store token in local storage or cookie
      localStorage.setItem('token', token);
      navigate('/HomePage');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await axios.post('/authRoutes/google-login', { token: credential });
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/HomePage');
    } catch (error) {
      setError('Google login failed.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed.');
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
      <p>
        Don't have an account? <a href="/">Register here</a>
      </p>
    </form>   
  );
};

export default LoginPage;
