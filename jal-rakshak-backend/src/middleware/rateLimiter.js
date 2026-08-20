const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes by default
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Strict Rate Limiter for Authentication and SOS Endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  apiLimiter,
  authLimiter,
};
