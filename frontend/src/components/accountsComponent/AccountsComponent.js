import React, { useState, useEffect } from 'react'
import './AccountsComponent.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';


function AccountsComponent() {
  
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => { 
    const token = localStorage.getItem('token');

    if(!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      // Decode the token to get the userId
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      console.log('Token:', token);
      console.log('User ID from token:', userId);

    if (!userId) {
      console.error('User ID is not set in localStorage.');
      return;
    }

    
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('API response:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user data');
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/orders/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        console.log('API response:', response.data)
        setOrders(response.data);
      } catch (error) {
        console.log('Error fetching orders:', error);
        setError('Failed to fetch order list data');
      }
    };
    
  
    fetchUser();
    fetchOrders();
  } catch (error) {
    console.error('Error decoding token:', error);
    navigate('/login');
  }
  }, [navigate]);

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='accountBody'>
     
        <div className='accountContainer'>          
          <h2>Account Details</h2>
          <div className='accountInfoSection'>
            <ul className='userSection'>
                <li className='usersDetail'>
                  <div className='personalInfo'>                    
                  {user ? (
                <>
                  <p>
                    First Name: {user.firstname}
                  </p>
                  <p>
                    Last Name: {user.lastname}
                  </p>
                  <p>
                    Username: {user.username}
                  </p>
                  <p>
                    Email: {user.email}
                  </p>
                </>
              ) : (
                <p>Loading user information...</p>
              )}
                  </div>
                </li>               
            </ul>
          </div>
        </div>

        <div className='orderContainer'>
          <h2>Order History</h2>
          <div className='orderListContainer'>
            <ul className='orderListBox'>
              { orders.length === 0 ? (
                <p className='emptyCartMessage'>You have no history of purchases.</p>
              ) : (   
              <>
                {orders.map((order) => (
                  <li key={order.id} className='orderlist'>
                    <Link to={`/orders/${order.cart_id}`}>             
                      <p>
                        Order Number:  {order.cart_id}
                      </p>
                      <p>
                        Purchase date:  {format(new Date(order.created), 'dd-MM-yyyy')}
                      </p>
                      <p>
                        Total Price: £ {order.totalPrice}
                      </p>
                      <p>
                        Order Status:  {order.status}
                      </p>
                    </Link>
                  </li>
                ))}
              </>            
              )}             
            </ul>
          </div>
        </div>            
    </div>
  )
}

export default AccountsComponent;