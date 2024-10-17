const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    console.log('Received token:', token); // Log token
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET); // Ensure Bearer is removed if present
    req.user = decoded;
    console.log('Decoded token:', decoded); // Log decoded token
    next();
  } catch (err) {
    console.error('Token validation failed:', err.message); // Log error
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
