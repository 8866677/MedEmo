const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user exists and is active
    User.findById(decoded.user.id)
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Token is not valid - user not found' });
        }
        
        if (!user.isActive) {
          return res.status(401).json({ error: 'Account is deactivated' });
        }
        
        if (user.isLocked()) {
          return res.status(423).json({ error: 'Account is temporarily locked due to multiple failed login attempts' });
        }
        
        req.user = decoded.user;
        next();
      })
      .catch(err => {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Server error in authentication' });
      });
      
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};
