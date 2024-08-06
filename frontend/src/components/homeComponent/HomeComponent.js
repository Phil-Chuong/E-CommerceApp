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
                <h2>Highlights 2024</h2>

                <ul className='homeProductCard'>
                    {limitedProducts.map((product) => (
                    <li key={product.id} className='homeProductItems'>
                        <Link to={`/products/${product.id}`}>
                            <h3>{product.name}</h3>
                            <img src={product.image_path} alt={product.name} />
                            <p>£{product.price}</p>
                        </Link>
                    </li>
                    ))}
                </ul>
            </div>
         </div>
    )
}

export default HomeComponent;