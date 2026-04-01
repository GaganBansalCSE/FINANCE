/**
 * User controller – handles HTTP layer for user management (admin only).
 */

const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/users
 * List all users. Supports ?role= and ?status= filters.
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const users = await userService.getAllUsers({ role, status });
    return sendSuccess(res, 200, 'Users retrieved', users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get a single user by ID.
 */
const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, 200, 'User retrieved', user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Create a new user (admin can specify role).
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, 201, 'User created', user);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id
 * Update a user's name, role, or status.
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 200, 'User updated', user);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Permanently delete a user.
 */
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return sendSuccess(res, 200, 'User deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
