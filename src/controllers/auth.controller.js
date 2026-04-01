/**
 * Auth controller – handles HTTP layer for register and login.
 */

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

/**
 * POST /api/auth/register
 * Register a new user. Role defaults to 'viewer'.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Log in and receive a JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Profile retrieved', {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
