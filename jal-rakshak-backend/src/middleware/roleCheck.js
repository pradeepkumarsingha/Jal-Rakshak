const { ErrorResponse } = require('./errorHandler');

/**
 * Grant access to specific roles
 * @param  {...string} roles - e.g. ('admin'), ('admin', 'rescue'), etc.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route. Required: [${roles.join(', ')}]`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  authorize,
  roleCheck: authorize,
};
