import React, {useState, useEffect, useRef} from 'react'
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
  const [focusedIndex, setFocusedIndex] = useState(-1); // Track focused result
  const navigate = useNavigate();

  // Refs for dropdown and search wrapper
  const dropdownRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  //Handle navbar on fixed when scroll down
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


  // Handle clicks outside the search dropdown
  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSearch);
    };
  }, []);
  
  // Handle clicks outside the mobile menu
  useEffect(() => {
    const handleClickOutsideMobileMenu = (event) => {
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideMobileMenu);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
    };
  }, []);
  
  
  //handle search
  const handleSearchChange = async (e) => {
    const query = e ? e.target.value : searchQuery; // Default to current searchQuery if e is not provided
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const response = await axios.get(`/search/search?query=${query}`);
        setSearchResults(response.data);
        setShowDropdown(true);
        setFocusedIndex(-1); // Reset focus index
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
      handleSearchChange(); // Ensure we fetch the search results before navigating
      navigate(`/search?query=${searchQuery}`);
      setShowDropdown(false);
    }
  };

  // Handle result click
  const handleResultClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowDropdown(false);
  };

  // Handle keydown events in the search input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && searchResults[focusedIndex]) {
        handleResultClick(searchResults[focusedIndex].id);
      } else {
        handleSearchSubmit(e);  // Trigger search on Enter key
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prevIndex) => (prevIndex - 1 + searchResults.length) % searchResults.length);
    }
  };

  // Handle logout
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

      <div className='searchbar' ref={searchWrapperRef}>
      <form className='navbar-search' onSubmit={handleSearchSubmit}>
        <input
          type='text'
          placeholder='Search...'
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown} // Add keydown handler here
          ref={searchInputRef} // Ref for focusing input
        />
        <button type='submit'>Search</button>
        {showDropdown && (
          <ul className='search-dropdown' ref={dropdownRef}>
            {searchResults.map((result, index) => (
              <li
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className={`search-dropdown-item ${index === focusedIndex ? 'focused' : ''}`}
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
      
      <div className={`mobile-menu ${mobileMenuActive ? 'active' : ''}`} ref={mobileMenuRef}>
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

