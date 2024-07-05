import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './ProductDetail.css';
import images from './Logo.jpg';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [cartId, setCartId] = useState(null);
  const [userId, setUserId] = useState(null);

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


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId; // Extract userId for future use if needed
      setUserId(userId); // Set userId state

      axios.get(`/user/${userId}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          if (response.data) {
            setCartId(response.data.id);
          }
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
        });
    }
  }, []);

  
  const handleAddCart = async () => {

    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Attempting to add product to cart...');
        let currentCartId = cartId;

        if (!currentCartId) {
          const newCartResponse = await axios.post('/cart/cart', { user_id: userId }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          currentCartId = newCartResponse.data.id;
          setCartId(currentCartId);
          console.log('New cart created:', currentCartId);
        }

        console.log('Adding product to cart with cartId:', currentCartId);

        const addProductResponse = await axios.post('/cart/cart_items', {
          cartId: currentCartId,
          productId: product.id,
          quantity: 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Product added to cart successfully!', addProductResponse.data);
        alert('Product added to cart successfully!');
      } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Error adding product to cart');
      }
    } else {
      console.error('No token found');
      alert('You need to be logged in to add products to the cart');
    }
  };
  
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
          <h3>What are you waiting for?</h3>
          <div className='stock'>
            <p>Availiable Stock {product.stock}</p>
          </div>
          <div className='addCart'>          
            <button onClick={handleAddCart}><p>Add to cart</p></button>
          </div>           
        </div>
      </div>
    </div>    
  );
};

export default ProductDetail;
