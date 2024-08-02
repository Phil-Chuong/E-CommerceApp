import React, { useEffect, useState } from 'react';
import { Link, redirect } from 'react-router-dom';
import stripeService from '../../Services/stripeService';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutComponent.css'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    const [cartId, setCartId] = useState(localStorage.getItem('cartId') || null);
    const token = localStorage.getItem('token'); 
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Retrieved token:', token);
        console.log('Retrieved cartId:', cartId);
        
        const fetchCartItems = async () => {
            if (!token || !cartId) {
                console.error('Token or cartId not found');
                setError('Token or cartId not found.');
                return;
            }

            try {
                const cartResponse = await axios.get(`/cart/cart_items/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Cart items fetched:', cartResponse.data); // Debugging log
                setCartItems(cartResponse.data); // Assuming response.data is an array
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Failed to load cart items');
            } finally {
                setLoading(false); // Set loading state to false on error
            }
        };

        fetchCartItems();
    }, [token, cartId]); // Include token in the dependency array


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productResponse = await axios.get('/products');
                //console.log('Products fetched:', productResponse.data); // Debugging log
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
            console.log('Stripe, cardElement, or cartId not available');
            return;
        }

        try {
            console.log('Creating payment method...');
            const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (paymentMethodError) {
                setPaymentError(paymentMethod.error.message);
                setLoading(false);
                console.log('Error creating payment method:', paymentMethodError.message);
                return;
            }        

            if (!cartId) {
                throw new Error('Cart ID not found in localStorage');
            }

            console.log('Calling stripeService.handlePayment with cartId:', cartId);
            const result = await stripeService.handlePayment(totalAmount, paymentMethod.id, cartId); //paymentMethod. Removed

            console.log('handlePayment result:', result);
            
            if (result.error) {
                setPaymentError(result.error);
                setLoading(false);
                return;
            }

            if (result.success) {
                console.log('Payment successful');
                setPaymentSuccess(true);

                setTimeout(() => {
                    navigate('/login'); // Corrected redirect function
                }, 5000);
                
                } else {
                    setCartId(null);
                    console.error('Payment failed');
            }
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

                <div className='bothPaymentContainer'>               
                    <div className="checkout-items-box">
                        {cartItems.map((item) => {
                                const product = products.find(product => product.id === item.product_id);
                                if (!product) return null; // Skip if product not found
                                return (
                                    <li key={item.id} className='checkout-items'>
                                        <div className='checkout-itemProduct'>
                                            <div className='checkout-img'>
                                                <img src={product.image_path} alt={product.name} />
                                            </div>

                                            <div className='checkout-payment-section'>                                 
                                                <h3>{product.name}</h3>
                                                <p>£{product.price}  X {item.qty}</p>                                           
                                            </div>
                                        </div>
                                    </li>                            
                                );                          
                            })}
                    </div>

                    <div className='cardPaymentContainer'>
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
                                <Link to="/login" style={{ fontSize: '32px' }}>
                                Thank you for Shopping with us.
                                </Link>
                            </div>
                        )}
                    </div>
                </div>         
            </div>
        </div>
    );
};

export default CheckoutComponent;