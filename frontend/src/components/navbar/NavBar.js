import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, House } from 'phosphor-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../navbar/NavBar.css'


const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const cartId = localStorage.getItem('cartId');
      
      if (!token || !cartId) {
        console.error('Token or cartId not found.');
        return;
      }

      // Send logout request to the server
      await axios.post('/auth/logout', { token, cartId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Clear tokens and cartId from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('cartId');

      navigate('/login'); // Redirect to login page after logout

    } catch (error) {
      console.error('Logout error:', error);
      // Handle error (e.g., display error message)
    }
  };

  return (
    <div className='navbar'>
      <div className='home'>
        <Link to={'/HomePage'}><House size={32} /></Link>
      </div>
      <div className='links'>
        <Link to={'/products'}>Products</Link>
        <Link to={'/accounts'}>Account</Link>
        <Link to={'/cart'}><ShoppingCart size={32} /></Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default NavBar

