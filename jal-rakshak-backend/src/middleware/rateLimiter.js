const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

/**
 * General API Rate Limiter
 * Liberal limit for development / live emergency telemetry sync
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 50000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: (req) =>
    isDev ||
    process.env.NODE_ENV === 'test' ||
    req.ip === '127.0.0.1' ||
    req.ip === '::1' ||
    req.ip === '::ffff:127.0.0.1',
});

/**
 * Strict Rate Limiter for Authentication and SOS Endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skip: (req) =>
    isDev ||
    process.env.NODE_ENV === 'test' ||
    req.ip === '127.0.0.1' ||
    req.ip === '::1' ||
    req.ip === '::ffff:127.0.0.1',
});

module.exports = {
  apiLimiter,
  authLimiter,
};
