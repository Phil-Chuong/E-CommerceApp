import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

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
    try {
      const response = await axios.post('/auth/register', { firstname, lastname, username, email, password });
      const { token } = response.data;
      // Store token in local storage or cookie
      localStorage.setItem('token', token);
      navigate('/HomePage');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error);
        // Update state with the error message
      } else {
        console.error('Error registering:', error);
        setError('Error registering user'); // Handle generic error message
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if present */}
      <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="First Name" required/>
      <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Last Name" required/>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required/>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required/>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/>
      <button type="submit">Register</button>
      <br/>
      <Link to="/login">Login</Link> {/* Use Link component for internal navigation */}
    </form>
    
  )
};

export default RegisterPage;
