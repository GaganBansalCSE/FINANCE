/**
 * User management routes (admin only)
 * GET    /api/users
 * POST   /api/users
 * GET    /api/users/:id
 * PATCH  /api/users/:id
 * DELETE /api/users/:id
 */

const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createUserRules,
  updateUserRules,
  userIdRule,
} = require('../validators/user.validator');

// All user routes require authentication and admin role
router.use(protect, authorize('admin'));

// @route   GET  /api/users
// @desc    List all users (with optional role/status filter)
// @access  Admin
router.get('/', getUsers);

// @route   POST /api/users
// @desc    Create a new user
// @access  Admin
router.post('/', createUserRules, validate, createUser);

// @route   GET  /api/users/:id
// @desc    Get a specific user by ID
// @access  Admin
router.get('/:id', userIdRule, validate, getUser);

// @route   PATCH /api/users/:id
// @desc    Update a user (name, role, status)
// @access  Admin
router.patch('/:id', updateUserRules, validate, updateUser);

// @route   DELETE /api/users/:id
// @desc    Permanently delete a user
// @access  Admin
router.delete('/:id', userIdRule, validate, deleteUser);

module.exports = router;
