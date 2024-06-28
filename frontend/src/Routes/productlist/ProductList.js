import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProductList = ({product}) => {
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
    <div>
        <div>
            <div><h1>Products</h1></div>
            <ul>
                {products.map((product) => (
                  <div key={product.id}>
                    <h3>{product.name}</h3>
                    <img src={product.image_path} alt={product.name} width="100" />
                  </div>
                ))}
            </ul>
        </div>
    </div>  
  )
}

export default ProductList