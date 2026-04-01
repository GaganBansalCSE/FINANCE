/**
 * Auth routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

const express = require('express');
const router = express.Router();

const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');

// @route   POST /api/auth/register
// @desc    Register a new user (defaults to viewer role)
// @access  Public
router.post('/register', registerRules, validate, register);

// @route   POST /api/auth/login
// @desc    Log in and receive JWT token
// @access  Public
router.post('/login', loginRules, validate, login);

// @route   GET /api/auth/me
// @desc    Get the currently authenticated user
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
