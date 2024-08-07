import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, House, ArrowsOut, UserList, SignOut, List } from 'phosphor-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../navbar/NavBar.css'


const NavBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 100) { // Adjust this value based on your layout
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await axios.get(`/search/search?query=${query}`);
        setSearchResults(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
      setShowDropdown(false);
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowDropdown(false);
  };

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

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  return (
    <div className={`navbar ${isFixed ? 'fixed' : ''}`}>
      <div className='home'>
        <Link to={'/HomePage'}><House size={32} alt='Home'/></Link>
      </div>

      <div className='searchbar'>
      <form className='navbar-search' onSubmit={handleSearchSubmit}>
        <input
          type='text'
          placeholder='Search...'
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type='submit'>Search</button>
        {showDropdown && (
          <ul className='search-dropdown'>
            {searchResults.map((result) => (
              <li
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className='search-dropdown-item'
              >
                {result.name}
              </li>
            ))}
          </ul>
        )}
      </form>
      </div>
      
      <div className='links'>
        <Link to={'/products'}><ArrowsOut size={32} alt='Products'/></Link>
        <Link to={'/cart'}  ><ShoppingCart size={32} alt='Cart'/></Link>
        <Link to={'/accounts'}><UserList size={32} alt='Accounts'/></Link>
        <button onClick={handleLogout}><SignOut size={32} alt='SignOut'/></button>
      </div>
      <div className='mobile-menu-icon' onClick={toggleMobileMenu}>
        <List size={32} />
      </div>
      <div className={`mobile-menu ${mobileMenuActive ? 'active' : ''}`}>
        <ul className='mobile-dropdown'>
          <li className='mobile-dropdown-item' onClick={() => navigate('/products')}>
            <ArrowsOut size={24} /> Products
          </li>
          <li className='mobile-dropdown-item' onClick={() => navigate('/cart')}>
            <ShoppingCart size={24} /> Cart
          </li>
          <li className='mobile-dropdown-item' onClick={() => navigate('/accounts')}>
            <UserList size={24} /> Account
          </li>
          <li className='mobile-dropdown-item' onClick={handleLogout}>
            <SignOut size={24} /> Log Out
          </li>
        </ul>
      </div>
    </div>
  )
}

export default NavBar

