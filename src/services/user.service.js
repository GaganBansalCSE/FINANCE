/**
 * User service – user management business logic (admin only).
 */

const User = require('../models/User');

/**
 * Get all users with optional filtering by role/status.
 * @param {object} filters - { role?, status? }
 * @returns {Promise<User[]>}
 */
const getAllUsers = async (filters = {}) => {
  const query = {};
  // Cast to string to prevent NoSQL injection; values are also validated
  // by express-validator at the route layer (enum check for role/status)
  if (filters.role) query.role = String(filters.role);
  if (filters.status) query.status = String(filters.status);
  return User.find(query).select('-__v');
};

/**
 * Get a single user by ID.
 * @param {string} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await User.findById(id).select('-__v');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Create a new user (admin action).
 * @param {object} data - { name, email, password, role? }
 * @returns {Promise<User>}
 */
const createUser = async ({ name, email, password, role }) => {
  // Cast to string to prevent NoSQL injection via object payloads
  const existing = await User.findOne({ email: String(email) });
  if (existing) {
    const err = new Error('Email is already registered');
    err.statusCode = 409;
    throw err;
  }
  const user = await User.create({ name, email: String(email), password, role });
  return User.findById(user._id).select('-__v');
};

/**
 * Update a user's name, role, or status.
 * @param {string} id
 * @param {object} updates - { name?, role?, status? }
 * @returns {Promise<User>}
 */
const updateUser = async (id, updates) => {
  const allowedFields = ['name', 'role', 'status'];
  const filtered = {};
  allowedFields.forEach((f) => {
    // Explicitly cast string fields to prevent NoSQL injection via object payloads
    if (updates[f] !== undefined) filtered[f] = String(updates[f]);
  });

  const user = await User.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  }).select('-__v');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Delete a user permanently.
 * @param {string} id
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
