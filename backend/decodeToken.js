// decodeToken.js
const jwt = require('jsonwebtoken');

// Replace this with the JWT token you want to decode
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

try {
    if (!token) {
      throw new Error('No token provided');
    }
  
    console.log('Token:', token);
  
    const decoded = jwt.decode(token, { complete: true });
  
    if (decoded) {
      console.log('Decoded Token:', decoded);
      console.log('Header:', decoded.header);
      console.log('Payload:', decoded.payload);
    } else {
      console.error('Failed to decode token');
    }
  } catch (error) {
    console.error('Error decoding token:', error.message);
  }