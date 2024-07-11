import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductDetailComponent.css';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';



function ProductDetailComponent() {

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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
      try {
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
    } catch (error) {
      console.error('Error decoding token:', error);
      }
    }
  }, []);

  
  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to add products to the cart');
      return;
    }

    try{
      console.log('Attempting to add product to cart...');
      let currentCartId = cartId;
      if (!currentCartId) {
          const newCartResponse = await axios.post('/cart/cart', { user_id: userId }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          currentCartId = newCartResponse.data.cartId;
          setCartId(currentCartId);
          localStorage.setItem('cartId', currentCartId);
          console.log('New cart created:', currentCartId);
        }

        console.log('Adding product to cart with cartId:', currentCartId);

        const addToCartResponse = axios.post('/cart/cart_items', {
          cartId: currentCartId,
          productId: product.id,
          quantity: 1
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Product added to cart:', addToCartResponse.data);
        alert('Product added to cart successfully!');
      } catch (error) {
        console.error('Error adding product to cart:', error);

        // Additional error information for debugging
        if (error.response) {
          console.error('Server responded with status code:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }

        alert('Error adding product to cart. Please try again.');
      }
    };
  
    if (loading) return <div>Loading...</div>; // Render loading state

    if (!product) return <div>No product found.</div>; // Handle case where product is not found


  return (
    <div className='productDetailBody'>
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
            <button onClick={handleAddToCart}><p>Add to cart</p></button>
          </div>           
        </div>

      </div>
    </div>
  )
}

export default ProductDetailComponent;