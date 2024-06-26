import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'phosphor-react'
import { House } from 'phosphor-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../navbar/NavBar.css'


const NavBar = () => {

  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/auth/logout', { token });  // Ensure this URL matches your backend route
      localStorage.removeItem('token'); // Clear authentication token
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className='navbar'>
      <div className='home'>
        <Link to={'/HomePage'}><House size={32} /></Link>
      </div>
      <div className='links'>
        <Link to={'/products'}>Products</Link>
        <Link to={'/cart'}><ShoppingCart size={32} /></Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default NavBar

