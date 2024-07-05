import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CartItemList.css';

function CartItemList() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [products, setProducts] = useState([]);

    // Retrieve token (assume you have a way to get the token, e.g., from context or localStorage)
    const token = localStorage.getItem('token'); // Replace with actual token retrieval logic

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const cartResponse = await axios.get('/cart/cart_items', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCartItems(cartResponse.data); // Assuming response.data is an array
                setLoading(false); // Set loading state to false on successful fetch
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setLoading(false); // Set loading state to false on error
            }
        };

        fetchCartItems();
    }, [token]); // Include token in the dependency array

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productResponse = await axios.get('/products');
                setProducts(productResponse.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    // Render loading state while fetching data
    if (loading) return <div>Loading...</div>;

    // Handle case where cartItems is not an array
    if (!Array.isArray(cartItems)) {
        return <div>Error: Failed to load cart items.</div>;
    }

    // Function to calculate total price
    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            const product = products.find(product => product.id === item.product_id);
            return total + (product ? product.price * item.qty : 0);
        }, 0);
    };

    return (
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
                                    <button>Remove</button>
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
    );
}

export default CartItemList;
