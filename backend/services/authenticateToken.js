// authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.sendStatus(403);
    }

    // Ensure userId is correctly extracted from the token
    console.log('Token payload:', user); // Debugging log
    req.user = user; // Ensure user object is correctly assigned
    next();
  });
}

module.exports = { authenticateToken };
