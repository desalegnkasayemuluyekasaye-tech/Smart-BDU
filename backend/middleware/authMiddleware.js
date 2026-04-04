const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartbdu_secret_key_2024');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  return res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const lecturer = (req, res, next) => {
  if (req.user && (req.user.role === 'lecturer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as lecturer' });
  }
};

module.exports = { protect, admin, lecturer };
