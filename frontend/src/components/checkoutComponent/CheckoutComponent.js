import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import stripeService from '../../Services/stripeService';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutComponent.css'; 
import axios from 'axios';


const CheckoutComponent = () => {

    const stripe = useStripe();
    const elements = useElements();
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [checkoutStatus, setCheckoutStatus] = useState(null);

    const token = localStorage.getItem('token'); // Replace with actual token retrieval logic
    const cartId = localStorage.getItem('cartId'); // Assuming you store cart_id after login

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                if (!token || !cartId) {
                    throw new Error('Token or cart_id not found.'); // Handle case where token or cart_id is missing
                }

                const cartResponse = await axios.get(`/cart/cart_items/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // console.log('Cart items fetched:', cartResponse.data); // Debugging log
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
                // console.log('Products fetched:', productResponse.data); // Debugging log
                setProducts(productResponse.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products');
            }
        };

            fetchProducts();
        }, []);


    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = cartItems.reduce((total, item) => {
                const product = products.find(product => product.id === item.product_id);
                return total + (product ? product.price * item.qty : 0);
            }, 0);

            setTotalAmount(total);
        };

        calculateTotalPrice();
    }, [cartItems, products]);


    const handlePayment = async () => {
        setLoading(true);
        setPaymentError(null);

        const cardElement = elements.getElement(CardElement);
        if (!stripe || !cardElement) {
            setLoading(false);
            console.log('Stripe or cardElement not available');
            return;
        }

        try {
            console.log('Creating payment method...');
            const paymentMethod = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            console.log('Payment method created:', paymentMethod);

            if (paymentMethod.error) {
                setPaymentError(paymentMethod.error.message);
                setLoading(false);
                console.log('Error creating payment method:', paymentMethod.error.message);
                return;
            }

            console.log('Payment method created:', paymentMethod);

            const cartId = localStorage.getItem('cartId'); // Retrieve cartId from localStorage
            if (!cartId) {
                throw new Error('Cart ID not found in localStorage');
            }

            console.log('Calling stripeService.handlePayment with cartId:', cartId);
            const result = await stripeService.handlePayment(totalAmount, paymentMethod.paymentMethod.id, cartId);

            console.log('handlePayment result:', result);
            
            if (result.error) {
                setPaymentError(result.error);
                setLoading(false);
                return;
            }

            setPaymentSuccess(true);
        } catch (error) {
            setPaymentError('Payment failed. Please try again.');
            console.error('Unhandled error during payment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return <div>No items in the cart.</div>;
      }

    return (
        <div className='checkoutBodyContainer'>
            <div className="checkout-container">
            <h2>Checkout</h2>

            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <div className="cart-items">
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
                                    </li>                            
                                );                          
                            })}
                    </div>

                    <p>Total Amount: £{totalAmount.toFixed(2)}</p>

                    {!paymentSuccess && (
                        <div className="payment-form">
                            <label>
                                Card Details:
                                <CardElement id="card-element" className="card-element" />
                            </label>

                            {paymentError && <p className="error-message">{paymentError}</p>}

                            <button onClick={handlePayment} disabled={loading}>
                                {loading ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    )}

                    {paymentSuccess && (
                        <div className="payment-success">
                            <p>Payment successful!</p>
                            <Link to="/homePage">Continue Shopping</Link>
                        </div>
                    )}
                </>
            )}
            </div>
        </div>
    );
};

export default CheckoutComponent;
