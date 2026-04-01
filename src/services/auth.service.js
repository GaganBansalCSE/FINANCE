/**
 * Auth service – registration and login business logic.
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user.
 * @param {object} data - { name, email, password, role? }
 * @returns {{ user: object, token: string }}
 */
const register = async ({ name, email, password, role }) => {
  // Check if a user with this email already exists
  // Cast to string to prevent NoSQL injection via object payloads
  const existing = await User.findOne({ email: String(email) });
  if (existing) {
    const err = new Error('Email is already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email: String(email), password, role });
  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token,
  };
};

/**
 * Log in an existing user.
 * @param {object} data - { email, password }
 * @returns {{ user: object, token: string }}
 */
const login = async ({ email, password }) => {
  // Include password field (excluded by default in schema)
  // Cast to string to prevent NoSQL injection via object payloads
  const user = await User.findOne({ email: String(email) }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (user.status === 'inactive') {
    const err = new Error('Your account is inactive. Contact an admin');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token,
  };
};

module.exports = { register, login };
