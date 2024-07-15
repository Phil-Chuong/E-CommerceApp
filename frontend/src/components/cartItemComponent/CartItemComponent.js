import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CartItemComponent.css';

function CartItemComponent({product}) {
    
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null); // Add error state

    // Retrieve token (assume you have a way to get the token, e.g., from context or localStorage)
    const token = localStorage.getItem('token'); // Replace with actual token retrieval logic
    const cartId = localStorage.getItem('cartId'); // Assuming you store cart_id after login
    // console.log('Token:', token); // Debugging log
    // console.log('cartId', cartId);

    useEffect(() => {
        const fetchCartItems = async () => {

            try {
                if (!token || !cartId) {
                    throw new Error('Token or cart_id not found.'); // Handle case where token or cart_id is missing
                }

                const cartResponse = await axios.get(`/cart/cart_items/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Cart items fetched:', cartResponse.data); // Debugging log
                setCartItems(cartResponse.data); // Assuming response.data is an array
                setLoading(false); // Set loading state to false on successful fetch
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Failed to load cart items');
                setLoading(false); // Set loading state to false on error
            }
        };

        fetchCartItems();
    }, [token, cartId]); // Include token in the dependency array


    useEffect(() => {
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
            console.log(`Attempting to delete cart item with id: ${itemId}`);
            const response = await axios.delete(`/cart/cart_items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.message);
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error removing item from cart:', error.response ? error.response.data : error.message);
        }
    };

    // Function to calculate total price
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const product = products.find(product => product.id === item.product_id);
            return total + (product ? product.price * item.qty : 0);
        }, 0);
    };


    // Render loading state while fetching data
    if (loading) return <div>Loading...</div>;

    // Handle case where there is an error
    if (error) return <div>Error: {error}</div>;

    // Handle case where cartItems is not an array
    if (!Array.isArray(cartItems) || !Array.isArray(products)) {
        return <div>Error: Failed to load cart items.</div>;
    }


    return (
        <div className='cartBody'>
            <div className='cartItemContainer'>               
                <div className='itemContainer'>
                    <h2>Your Cart</h2>

                    <div className='itemBox'>
                        <div className='itemBoxChild'>
                            <ul className='cartItemUL'>
                            {cartItems.map((item) => {
                                const product = products.find(product => product.id === item.product_id);
                                if (!product) return null; // Skip if product not found
                                return (
                                    <li key={item.id} className='items'>
                                        <div className='itemProduct'>
                                            <h3>{product.name}</h3>
                                            <img src={product.image_path} alt={product.name} />
                                            <p>£{product.price} X {item.qty}</p>                                           
                                        </div>

                                        <div className='addRemove'>
                                            <button onClick={() => handleRemove(item.id)}>Remove</button>
                                        </div> 
                                    </li>                            
                                );                          
                            })}
                            </ul> 
                        </div>
                    
                        <div className='totalPrice'>
                            <h3>Total Price: £{calculateTotalPrice().toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>        
    );
}

export default CartItemComponent;
