import React from 'react'
import axios from 'axios';
import './ProductListComponent.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const imageURL = `https://techtitan.onrender.com${product.image_path}`;

function ProductListComponent({product}) {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

    axios.get('/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => setProducts(response.data))
        .catch(error => console.error('Error fetching products:', error));
    }, [navigate]);


  return (
    <div className='productListBody'>
      <div className='productContainer'>
      <h2>Instock Now!!</h2>      
        <ul className='productCard'>         
            {products.map((product) => (
              <Link to={`/products/${product.id}`} key={product.id}>
                <li className='productItems'>
                  <h3>{product.name}</h3>
                  <img src={imageURL} alt={product.name} />
                <p>£{product.price}</p>
                </li>
              </Link>
            ))}
        </ul>        
      </div>
    </div> 
  )
}

export default ProductListComponent