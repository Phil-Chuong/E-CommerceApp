import React, { useState, useEffect } from 'react'
import './AccountsComponent.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

function AccountsComponent() {
  
  const [user, setUser] = useState(null);
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
      //navigate('/login');
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
  
    fetchUser();
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
                </>
              ) : (
                <p>Loading user information...</p>
              )}
                  </div>
                </li>               
            </ul>
          </div>
        </div>

        <div className='orderHistoryContainer'>
          <h2>Order History</h2>
          <div className='orderHistoryList'>
          
          </div>
        </div>
    </div>
  )
}

export default AccountsComponent