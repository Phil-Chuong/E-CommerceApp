import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';
import Logo from '../images/Logo.jpg';

const RegisterPage = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    try {
      const response = await axios.post('/auth/register', { firstname, lastname, username, email, password });
      console.log('Registration response:', response.data);
      
      const { accessToken, cartId } = response.data;
      console.log('Received token:', accessToken);

      // Store token in local storage or cookie
      localStorage.setItem('token', accessToken); // Make sure 'token' is the actual token string
      console.log('Stored token:', accessToken);

      localStorage.setItem('cartId', cartId);

      navigate('https://tech-titan.onrender.com/HomePage');
    } catch (error) {
      if (error.response) {
        console.error('Registration error:', error.response.data.error);
        setError(error.response.data.error);
      } else {
        console.error('Error registering:', error);
        setError('Error registering user'); // Handle generic error message
      }
    }
  };

  return (
    <div className='registerBody'>
      <form className='registerForm' onSubmit={handleSubmit}>
        <img className='logo' src={Logo} alt='companyLogo'/>
        <h2>Register</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if present */}
        <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="First Name" required/>
        <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Last Name" required/>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required/>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required/>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/>
        <button type="submit">Register</button>
        <br/>
        <Link to="https://tech-titan.onrender.com/login">Login</Link> {/* Use Link component for internal navigation */}
      </form>
    </div>    
  )
};

export default RegisterPage;
