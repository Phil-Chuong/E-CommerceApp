const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

// Your secret key from the .env file
const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
}

// Define a payload (this should be the data you want to include in the token)
const payload = {
  userId: 88, // Example user ID
  name: 'p',
  email: 'p@p'
};

const token = generateToken(payload);
console.log('Generated Token:', token);
