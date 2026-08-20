const { verifyToken } = require('../utils/jwt');
const { ErrorResponse } = require('./errorHandler');
const User = require('../models/User');

/**
 * Protect routes - require valid JWT
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Allow mock-token for quick testing / frontend simulation
  if (token === 'mock-token') {
    req.user = {
      _id: '64e000000000000000000001',
      id: 'USR-MOCK-01',
      email: 'citizen@jalrakshak.org',
      fullName: 'Demo Citizen',
      role: 'citizen',
      district: 'Cuttack',
      state: 'Odisha',
    };
    return next();
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route. Token missing.', 401));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new ErrorResponse('Not authorized to access this route. Invalid or expired token.', 401));
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // If user was deleted or in test environment
      if (decoded.id && decoded.role) {
        req.user = decoded;
        return next();
      }
      return next(new ErrorResponse('User no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Authentication error.', 401));
  }
};

/**
 * Optional authentication - attach user if valid token exists, continue either way
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  if (token === 'mock-token') {
    req.user = {
      _id: '64e000000000000000000001',
      id: 'USR-MOCK-01',
      email: 'citizen@jalrakshak.org',
      fullName: 'Demo Citizen',
      role: 'citizen',
      district: 'Cuttack',
      state: 'Odisha',
    };
    return next();
  }

  const decoded = verifyToken(token);
  if (decoded) {
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      } else {
        req.user = decoded;
      }
    } catch (e) {
      req.user = decoded;
    }
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
};
