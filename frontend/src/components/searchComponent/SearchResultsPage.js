import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchResultsPage.css';


const SearchResultsPage = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchSearchResults = async (query) => {
      try {
        const response = await axios.get(`/search/search?query=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query');

    if (query) {
      fetchSearchResults(query);
    }
  }, [location.search]); // Add fetchSearchResults to the dependency array

  return (
    <div className='searchBody'>
      <div className='searchContainer'>
        <h2>Search Results</h2>

        <div className='searchBox'>
          <ul className='searchCard'>
            {results.map((product) => {
              //const imageURL = `https://techtitan.onrender.com${product.image_path}`;
              const imageURL = `http://localhost:4000${product.image_path}`;

              return (
              <Link to={`/products/${product.id}`} key={product.id}>
                <li className='productItems'>
                  <h3>{product.name}</h3>
                    {product.image_path ? (
                    <img src={imageURL} alt={product.name} />
                    ) : (

                    <div className="placeholder-image">No Image Available</div>
                    )}
                    {product.price ? (
                    <p>£{product.price}</p>
                    ) : (
                    <p>Price not available</p>
                  )}
                </li>
              </Link>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
