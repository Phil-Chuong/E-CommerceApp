const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'No token provided' }); // Return a more specific error message
  }

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Assuming decodedToken has userId, ensure this matches your token's payload
    if (!decodedToken.userId) {
      console.error('User ID not found in token');
      return res.status(403).json({ error: 'User ID not found in token' });
    }

    // Ensure userId is correctly extracted from the token
    console.log('Token payload:', decodedToken); // Debugging log - remove or limit in production
    
    req.userId = decodedToken.userId; // Ensure user object is correctly assigned
    next();
  });
}

module.exports = { authenticateToken };
