import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomeComponent.css';

function HomeComponent() {

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

    const limitedProducts = products.slice(0, 10); // Limit to 10 products

    return (
        <div className='homepageBody'>
            <div className='homeProductContainer'>
                <p className='intro'>Welcome to Tech Titan online store, your one-stop shop for high-quality tech gadgets, stylish apparel, home essentials, and unique accessories. Designed for a seamless shopping experience on any device, we offer the best products at competitive prices. Explore our collections and enjoy exceptional service with every purchase.</p>
                <h2>Highlights 2024</h2>

                <ul className='homeProductCard'>
                    {limitedProducts.map((product) => {
                        const imageURL = `https://techtitan.onrender.com${product.image_path}`;

                        return (
                            <li key={product.id} className='homeProductItems'>
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

export default HomeComponent;