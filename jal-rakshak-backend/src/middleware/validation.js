const { validationResult } = require('express-validator');
const { ErrorResponse } = require('./errorHandler');

/**
 * Middleware to check for express-validator validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    const message = errorDetails.map((e) => `${e.field}: ${e.message}`).join(', ');
    return next(new ErrorResponse(message, 400, errorDetails));
  }
  next();
};

module.exports = {
  validate,
};
