import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CartItemComponent.css';
import { useNavigate } from 'react-router-dom';

function CartItemComponent() {
    
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null); // Add error state
    const [cartId, setCartId] = useState(localStorage.getItem('cartId') || '');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
 

    useEffect(() => {
        console.log('Component mounted or updated');
        console.log('Current cartId:', cartId);
        console.log('Token:', token);

        const fetchCartItems = async () => {  
            console.log('fetching cart items with cartId', cartId);      

            if (!token || !cartId) {
                console.log('Token or cartId or userId not found.');
                setError('Token or cart_id or userId not found.');
                setLoading(false);
                return;
            }
            
            try {
                // Add a log to verify cartId value
                console.log('Fetching cart items with cartId:', cartId);
                const cartResponse = await axios.get(`/cart/cart_items/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Cart items fetched:', cartResponse.data); // Debugging log
                
                setCartItems(cartResponse.data.items || cartResponse.data);
                setLoading(false); // Set loading state to false on successful fetch
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Failed to load cart items');
                setLoading(false); // Set loading state to false on error
            }
        };

        fetchCartItems();
    }, [token, cartId]);


    useEffect(() => {
        console.log('Fetching products');

        const fetchProducts = async () => {
            try {
                const productResponse = await axios.get('/products');
                console.log('Products fetched:', productResponse.data); // Debugging log
                
                setProducts(productResponse.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products');
            }
        };

            fetchProducts();
        }, []);


    const handleRemove = async (itemId) => {
        try {
              console.log(`Attempting to decrement cart item with id: ${itemId}`);
              const response = await axios.put(`/cart/cart_items/${itemId}/decrement`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log(`Decrement response: ${JSON.stringify(response.data)}`);
              console.log(response.data.message);
        
              setCartItems(prevItems => {
                return prevItems.map(item => {
                  if (item.id === itemId) {
                    if (item.qty === 1) {
                      return null; // Remove the item if quantity is 1
                    }
                    return { ...item, qty: item.qty - 1 }; // Decrement the quantity
                  }
                  return item;
                }).filter(Boolean); // Filter out null values
              });
        } catch (error) {
            console.error('Error decrementing item from cart:', error.response ? error.response.data : error.message);
        }
    };
          
    const handlePayment = () => {
        console.log('Navigating to checkout');
        navigate('/checkout');
    };

    // Function to calculate total price
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const product = products.find(product => product.id === item.product_id);
            return total + (product ? product.price * item.qty : 0);
        }, 0);
    }

    if (loading) return <div>Loading...</div>;

    if (error) return <div>Error: {error}</div>;

    // Handle case where cartItems is not an array
    if (!Array.isArray(cartItems) || !Array.isArray(products)) {
        return <div>Error: Failed to load cart items.</div>;
    }

    return (
        <div className='cartBody'>
            <div className='cart-main'>
             {cartItems.length === 0 ? (
                <p className='emptyCart'>Add something to your cart.</p>
            ) : (
               <div className='cartItemContainer'>
                    <h2 className='cartTitle'>Your Cart</h2>

                    <div className='mainContainer'>
                        <div className='itemContainer'>
                            <div className='itemBox'>
                                <ul className='cartItemUL'>
                                {cartItems.map((item) => {
                                    const product = products.find(product => product.id === item.product_id);
                                    if (!product) return null; // Skip if product not found
                                    const imageURL = `http://localhost:4000${product.image_path}`;                                   
                                    //const imageURL = product?.image_path ? `https://techtitan.onrender.com${product.image_path}` : 'default_image_path'; // Provide a fallback image URL                                  
                                        
                                    return (
                                        <li key={item.id} className='items'>
                                                <div className='itemProduct'>
                                                    <img src={imageURL} alt={product.name} />
                                                    <div>
                                                        <h3>{product.name}</h3>
                                                        <p>£{product.price} X {item.qty}</p>                                           
                                                    </div>
                                                </div>

                                                <div className='addRemove'>
                                                    <button onClick={() => handleRemove(item.id)}>Remove</button>
                                                </div> 
                                        </li>                            
                                    );                          
                                })}
                                </ul> 
                            </div>
                        </div>

                        <div className='paymentContainer'>
                            <div className='bothPayment'>
                                <div className='totalPrice'>
                                    <h3>Total Price: £{calculateTotalPrice().toFixed(2)}</h3>
                                </div>

                                <div className='paymentBox'>
                                    <button onClick={handlePayment}>Procced to payment</button>
                                </div>   
                            </div>  
                        </div>
                    </div>

                </div> 
            )}      
            </div>
                   
        </div>        
    );
}

export default CartItemComponent;
