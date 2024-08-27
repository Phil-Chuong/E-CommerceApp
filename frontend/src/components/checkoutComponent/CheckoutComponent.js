import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import stripeService from '../../Services/stripeService';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutComponent.css'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CheckoutComponent = () => {
    // Assuming you use cartItems inside the component
    //console.log('Cart items in CheckoutComponent:', cartItems);

    const stripe = useStripe();
    const elements = useElements();
    //const navigate = useNavigate();

    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);

    //const [checkoutStatus, setCheckoutStatus] = useState(null);

   //const [cartId, setCartId] = useState(localStorage.getItem('cartId') || null);
   const cartId = localStorage.getItem('cartId');
   const token = localStorage.getItem('token'); 


    useEffect(() => {
        console.log('Retrieved token:', token);
        console.log('Retrieved cartId:', cartId);
        console.log('Component mounted. Retrieved token:', token, 'Retrieved cartId:', cartId);
        
        if (!token || !cartId) {
            setError('Token or cartId not found.');
            return;
        }

        const fetchCartItems = async () => {

            try {
                const cartResponse = await axios.get(`/cart/cart_items/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Cart items fetched:', cartResponse.data); // Debugging log
                setCartItems(cartResponse.data);
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Failed to load cart items');
            }
        };

        fetchCartItems();
    }, [token, cartId]);


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productResponse = await axios.get('/products');
                console.log('Products fetched:', productResponse.data); // Debugging log
                setProducts(productResponse.data);
            } catch (error) {
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
        console.log('handlePayment function called');
        if (!stripe || !elements) {
            console.log('Stripe or Elements not loaded');
            setPaymentError('Stripe.js has not loaded yet.');
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            console.log('CardElement not found');
            setPaymentError('CardElement not found.');
            return;
        }

        console.log('CardElement found:', cardElement);

        setLoading(true);
        setPaymentError(null);

        try {
            console.log('Creating payment method...');
            const paymentMethodId = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            console.log('Payment method created:', paymentMethodId);

            if (paymentMethodId) {
                console.log('Error creating payment method:', paymentMethodId.message);
                setPaymentError(paymentMethodId.message);
                return;
            }

            console.log('Payment method created:', paymentMethodId);

            // const cartId = localStorage.getItem('cartId'); // Retrieve cartId from localStorage
            // if (!cartId) {
            //     throw new Error('Cart ID not found in localStorage');
            // }

            // console.log('Calling stripeService.handlePayment with cartId:', cartId);
            const result = await stripeService.handlePayment(totalAmount, paymentMethodId, cartId);
            //console.log('handlePayment result:', result);

            if (result.error) {
                console.log('Error from handlePayment:', result.error);
                setPaymentError(result.error);
                // setLoading(false);
                return;
            }

            setPaymentSuccess(true);
        } catch (error) {
            console.log('Unhandled error during payment:', error);
            setPaymentError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (loading) {
        return <div className="loading-message">Processing your payment...</div>;
    }

    if (cartItems.length === 0) {
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
                            const imageURL = `https://techtitan.onrender.com${product.image_path}`;
                            //const imageURL = product?.image_path ? `https://techtitan.onrender.com${product.image_path}` : 'default_image_path'; // Provide a fallback image URL

                            return (
                                <li key={item.id} className='checkout-items'>
                                    <div className='checkout-itemProduct'>
                                        <div className='checkout-img'>
                                            <img src={imageURL} alt={product.name || 'Product Image'} />
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
                                    <CardElement className="card-element" aria-hidden="true"/>
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
