import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';
import images from './Logo.jpg';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    setLoading(true); // Set loading state to true on mount or id change
    axios.get(`/products/${id}`)
      .then(response => {
        setProduct(response.data);
        setLoading(false); // Set loading state to false on successful fetch
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        setLoading(false); // Set loading state to false on error
      });
  }, [id]);

  if (loading) return <div>Loading...</div>; // Render loading state

  if (!product) return <div>No product found.</div>; // Handle case where product is not found

  return (
    <div className='productDetailBody'>
      <div className='productTitleHeader'>
        <img src={images} alt='titleLogo' className='productTitleLogo'/>
      </div>

      <div className='productDetailContainer'>

        <div className="productDetailCard">
        <img src={product.image_path} alt={product.name} className="product-image" />
          <div className='productDetailInfo'>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>£{product.price}</p>
          </div>              
        </div>

        <div className='cartContainer'>
          <h3>cart component goes here!!</h3>
        </div>
      </div>
    </div>    
  );
};

export default ProductDetail;
