/**
 * JWT helper – generate and verify tokens.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 * @param {string} userId
 * @param {string} role
 * @returns {string} signed token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify a JWT and return the decoded payload.
 * Throws if invalid or expired.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
