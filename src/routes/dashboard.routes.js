/**
 * Dashboard analytics routes
 *
 * GET /api/dashboard/summary          – All roles
 * GET /api/dashboard/category-totals  – Analyst, Admin
 * GET /api/dashboard/recent           – All roles
 * GET /api/dashboard/monthly-trends   – Analyst, Admin
 * GET /api/dashboard/weekly-trends    – Analyst, Admin
 */

const express = require('express');
const router = express.Router();

const {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends,
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All dashboard routes require authentication
router.use(protect);

// @route   GET /api/dashboard/summary
// @desc    High-level income, expense, net balance
// @access  Viewer, Analyst, Admin
router.get('/summary', getSummary);

// @route   GET /api/dashboard/category-totals
// @desc    Totals grouped by category
// @access  Analyst, Admin
router.get('/category-totals', authorize('analyst', 'admin'), getCategoryTotals);

// @route   GET /api/dashboard/recent
// @desc    Recent financial activity (latest records)
// @access  Viewer, Analyst, Admin
router.get('/recent', getRecentActivity);

// @route   GET /api/dashboard/monthly-trends
// @desc    Month-by-month trends for a given year
// @access  Analyst, Admin
router.get('/monthly-trends', authorize('analyst', 'admin'), getMonthlyTrends);

// @route   GET /api/dashboard/weekly-trends
// @desc    Week-by-week trends for the last N weeks
// @access  Analyst, Admin
router.get('/weekly-trends', authorize('analyst', 'admin'), getWeeklyTrends);

module.exports = router;
