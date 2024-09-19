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

    const cartId = localStorage.getItem('cartId');
    const token = localStorage.getItem('token'); 


    useEffect(() => {
       
        if (!token || !cartId) {
            console.error('Token or cartId not found.');
            setError('Token or cartId not found.');
            return;
        }

        const fetchCartItems = async () => {
            try {
                //console.log('Fetching cart items...');
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
        console.log('Fetching products...');
        const fetchProducts = async () => {
            try {
                const productResponse = await axios.get('/products');
                //console.log('Products fetched:', productResponse.data); // Debugging log
                setProducts(productResponse.data);
            } catch (error) {
                console.error('Failed to load products:', error);
                setError('Failed to load products');
            }
        };

            fetchProducts();
        }, []);


    useEffect(() => {
        //console.log('Calculating total price...');
        if (cartItems.length > 0 && products.length > 0) {
        const calculateTotalPrice = () => {
            const total = cartItems.reduce((total, item) => {
                const product = products.find(product => product.id === item.product_id);
                return total + (product ? product.price * item.qty : 0);
            }, 0);

            setTotalAmount(total);
        };

        calculateTotalPrice();
        }
    }, [cartItems, products]);

    
    const handlePayment = async () => {

        if (!stripe || !elements) {
            console.log('Stripe or cardElement not available');
            return;
        }

        // Retrieve the CardElement before proceeding
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            console.error('CardElement not found.');
            return;
        }

        try {
            console.log('Creating payment method...');
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            console.log('Payment method created:', paymentMethod);

            if (error) {
                console.log('Error creating payment method:', error.message);
                return;
            }

            //console.log('Payment method created:', paymentMethod);

            const cartId = localStorage.getItem('cartId'); // Retrieve cartId from localStorage
            if (!cartId) {
                throw new Error('Cart ID not found in localStorage');
            }

            console.log('Calling stripeService.handlePayment with cartId:', cartId);
            const result = await stripeService.handlePayment(totalAmount, paymentMethod.id, cartId);

            console.log('handlePayment result:', result);

            if (result.error) {
                return;
            }

            setPaymentSuccess(true);
        } catch (error) {
            console.error('Unhandled error during payment:', error);
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
                            const imageURL = `https://techtitan.onrender.com${product.image_path}`;
                            //const imageURL = `http://localhost:4000${product.image_path}`;

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
                                    <CardElement className="card-element" />
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
                                <Link to="/Login" style={{ fontSize: '32px' }}>
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
