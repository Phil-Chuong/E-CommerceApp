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
    console.log('Stored token:', token); // Check if token is present
  
    if (!token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded token:', decodedToken); // Check if token can be decoded
        const userId = decodedToken.userId; // Extract userId for future use if needed
        setUserId(userId); // Set userId state
  
        axios.get(`/user/${userId}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          //console.log('Cart data:', response.data); // Check if cart data is received
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
    } else {
      console.log('No token found in localStorage');
      // Handle case where token is not present (e.g., redirect to login page)
    }
  }, []); // Empty dependency array ensures this effect runs only once on component mount
  

  
  const handleAddToCart = async (product) => {

    try {
        // Log the product object for debugging
        console.log('Product:', product);

        // Check if product is valid
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            alert('Invalid product. Please try again.');
            return;
        }

        // Retrieve token and cartId from localStorage
        const accessToken = localStorage.getItem('accessToken');
        const token = localStorage.getItem('token');
        let cartId = localStorage.getItem('cartId');

        if (!token || !accessToken) {
            alert('You need to be logged in to add products to the cart');
            return;
        }

        // If cartId is not found in localStorage, create a new cart
        if (!cartId) {
            console.log('No cartId found. Creating a new cart...');

            const newCartResponse = await axios.post('/cart/cart', { user_id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (newCartResponse.data && newCartResponse.data.cartId) {
                let cartId = newCartResponse.data.cartId;
                localStorage.setItem('cartId', cartId);
                console.log('New cart created with ID:', cartId);
            } else {
                console.error('Failed to create a new cart:', newCartResponse.data);
                alert('Failed to create a new cart. Please try again.');
                return;
            }
            
          }
          

        // Fetch product details including stock
        const productResponse = await axios.get(`/products/${product.id}`);
        const currentStock = productResponse.data.stock;

        // Check if there is enough stock to add to cart
        if (currentStock <= 0) {
            alert('Product is out of stock');
            return;
        }

        console.log('Adding product to cart with cartId:', cartId);

        // Add product to cart
        const addToCartResponse = await axios.post('/cart/cart_items', {
            cartId: parseInt(cartId), // Ensure cartId is an integer
            productId: parseInt(product.id),
            quantity: 1
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Product added to cart:', addToCartResponse.data);
        alert('Product added to cart successfully!');
    } catch (error) {
        console.error('Error adding product to cart:', error);

        // Additional error handling for debugging
        if (error.response) {
            if (error.response.status === 403) {
                console.error('Invalid token or unauthorized:', error.response.data);
                // Handle unauthorized access or token expiration
                // Redirect to login or refresh token
            } else {
                console.error('Server responded with status code:', error.response.status);
                console.error('Response data:', error.response.data);
            }
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
          <p><span style={{ color: 'red' }}>Available Stock:</span> {product.stock}</p>
          </div>

          <div className='addCart'>          
            <button onClick={() => handleAddToCart(product)}><p>Add to cart</p></button>
          </div>           
        </div>

      </div>
    </div>
  )
}

export default ProductDetailComponent;