/**
 * Role-based access control middleware.
 *
 * Usage:
 *   router.post('/records', protect, authorize('admin', 'analyst'), createRecord);
 *
 * Only users whose role is in the allowed list will proceed.
 */

const { sendError } = require('../utils/response');

/**
 * Restrict access to specific roles.
 * @param {...string} roles - allowed role names
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Role '${req.user.role}' is not authorized to perform this action`
      );
    }
    next();
  };
};

module.exports = { authorize };
