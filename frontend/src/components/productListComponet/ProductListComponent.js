import React from 'react'
import axios from 'axios';
import './ProductListComponent.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
            {products.map((product) => {
              const imageURL = `https://techtitan.onrender.com${product.image_path}`;
              //const imageURL = `http://localhost:4000${product.image_path}`;
              return (
                <li  key={product.id} className='productItems'>
                  <Link to={`/products/${product.id}`}>
                    <h3>{product.name}</h3>
                    <img src={imageURL} alt={product.name} />
                    <p>£{product.price}</p>
                  </Link>
                </li>
              );             
            })}
        </ul>        
      </div>
    </div> 
  )
}

export default ProductListComponent