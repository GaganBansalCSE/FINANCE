/**
 * Authentication middleware.
 *
 * Extracts the JWT from the Authorization header (Bearer scheme),
 * verifies it, loads the matching user from the database,
 * and attaches the user to req.user.
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    let token;

    // Support "Authorization: Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Not authorized – no token provided');
    }

    // Verify signature and expiry
    const decoded = verifyToken(token);

    // Load user and ensure they are still active
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User belonging to this token no longer exists');
    }
    if (user.status === 'inactive') {
      return sendError(res, 403, 'Your account is inactive. Contact an admin');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired');
    }
    next(error);
  }
};

module.exports = { protect };
