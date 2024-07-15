const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ error: 'No token provided' }); // Return a more specific error message
  }
  // if (token == null) return res.sendStatus(401); // If there's no token

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Ensure userId is correctly extracted from the token
    console.log('Token payload:', decodedToken); // Debugging log - remove or limit in production
    
    req.user = decodedToken; // Ensure user object is correctly assigned
    next();
  });
}

module.exports = { authenticateToken };
