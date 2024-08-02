import React, { useState, useEffect } from 'react'
import './AccountsComponent.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AccountsComponent() {
  
  const [user, setUser] = useState(null);
  //const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => { 
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if(!token) {
      navigate('/login');
      return;
    }

    if (!userId) {
      console.error('User ID is not set in localStorage.');
      setError('User ID is not available.');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user data');
      }
    };

    fetchUser();
  }, [navigate]);


  if (error) {
    return <div>Error: {error}</div>; // Show error if there's an issue
  }

  if (!user) {
    return <div>Loading...</div>; // Render a loading state until the user data is fetched
  }

  return (
    <div className='accountBody'>
        <div className='accountContainer'>          
          <h2>Account Details</h2>
          <div className='accountInfoSection'>
            <ul className='userSection'>
                <li className='usersDetail'>
                  <div className='personalInfo'>                    
                  <p>
                    <span style={{ color: 'red' }}>First Name:</span> {user.firstname}
                  </p>
                  <p>
                    <span style={{ color: 'red' }}>Last Name:</span> {user.lastname}
                  </p>
                  <p>
                    <span style={{ color: 'red' }}>Username:</span> {user.username}
                  </p>
                  <p>
                    <span style={{ color: 'red' }}>Email:</span> {user.email}
                  </p>
                  </div>
                </li>               
            </ul>
          </div>
        </div>

        <div className='orderHistoryContainer'>
          <h2>Order History</h2>
          <div className='orderHistoryList'>
          {/* {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <ul>
              {orders.map((order) => (
                <li key={order.cart_id}>
                  <p><span style={{ color: 'red' }}>Cart ID:</span> {order.cart_id}</p>
                  <p><span style={{ color: 'red' }}>Created:</span> {new Date(order.created).toLocaleDateString()}</p>
                  <p><span style={{ color: 'red' }}>Total Price:</span> ${order.totalPrice.toFixed(2)}</p>
                  <p><span style={{ color: 'red' }}>Status:</span> {order.status}</p>
                </li>
              ))}
            </ul>
          )} */}
          </div>
        </div>
    </div>
  )
}

export default AccountsComponent