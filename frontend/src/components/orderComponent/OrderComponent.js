import React, {useState, useEffect} from 'react';
import './OrderComponent.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function OrderComponent() {

    const { cartId } = useParams();
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrders = async () => {
            console.log('fetching update order by cart id', cartId);

            if(!token || !cartId) {               
                setError('Token or cart id not found');
                setLoading(false);
                return;
            }

            try {
                const orderResponse = await axios.get(`/cart/cart_items/${cartId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Cart items fetched:', orderResponse.data);
                setCartItems(orderResponse.data.items || orderResponse.data);
                setLoading(false);
            }catch (error) {
                console.error('Error fetching cart items:', error);
                setError('Failed to load cart items');
                setLoading(false);
            }            
          };
        
          fetchOrders()
    }, [token, cartId]);


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


    if (loading) return <div>Loading...</div>;

    // Handle case where there is an error
    if (error) return <div>Error: {error}</div>;


    return (
        <div className='orderHistoryBody'>
            <div className='orderHistoryContainer'>
                <h2 className='orderTitle'>Order number: {cartId}</h2>
            
                <ul className='orderItems'>
                    {cartItems.map((item) => {
                        const product = products.find(product => product.id === item.product_id);
                        if (!product) return null; // Skip if product not found
                            return (
                                <li key={item.id} className='orderlistBox'>
                                    <div className='orderCard'>
                                        <div className='orderImg'>
                                            <img src={product.image_path} alt={product.name} />
                                        </div>
                                        
                                        <div className='orderDetail'>
                                            <h3>{product.name}</h3>
                                            <p>£{product.price} X {item.qty}</p>                                           
                                        </div>
                                    </div>
                                </li>                            
                            );                          
                    })}
                </ul>
            </div>
        </div>
    )
}

export default OrderComponent;