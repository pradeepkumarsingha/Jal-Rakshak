const { protect, optionalAuth } = require('./auth');
const { authorize, roleCheck } = require('./roleCheck');
const { validate } = require('./validation');
const { errorHandler, ErrorResponse } = require('./errorHandler');
const { apiLimiter, authLimiter } = require('./rateLimiter');
const { uploadSingleImage, uploadMultipleImages, upload } = require('./upload');

module.exports = {
  protect,
  optionalAuth,
  authorize,
  roleCheck,
  validate,
  errorHandler,
  ErrorResponse,
  apiLimiter,
  authLimiter,
  uploadSingleImage,
  uploadMultipleImages,
  upload,
};
