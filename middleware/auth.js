const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');

// This middleware protects routes that only institutions can access
// It checks if a valid JWT token is sent in the request header

const protect = async (req, res, next) => {
  try {
    let token;

    // token comes in the header like: Authorization: Bearer xxxxx
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not logged in. Please log in first.' });
    }

    // verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach the institution to the request so routes can use it
    req.institution = await Institution.findById(decoded.id).select('-password');

    if (!req.institution) {
      return res.status(401).json({ message: 'Institution no longer exists' });
    }

    next(); // move on to the actual route

  } catch (err) {
    res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

module.exports = protect;