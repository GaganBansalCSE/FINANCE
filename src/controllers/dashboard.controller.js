/**
 * Dashboard controller – handles HTTP layer for analytics/summary APIs.
 */

const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/dashboard/summary
 * Returns total income, total expenses, and net balance.
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    return sendSuccess(res, 200, 'Dashboard summary retrieved', summary);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/category-totals
 * Returns income/expense totals grouped by category.
 */
const getCategoryTotals = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryTotals();
    return sendSuccess(res, 200, 'Category totals retrieved', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/recent
 * Returns the most recent financial records.
 * Query param: limit (default 10)
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await dashboardService.getRecentActivity(limit);
    return sendSuccess(res, 200, 'Recent activity retrieved', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/monthly-trends
 * Returns month-by-month income/expense breakdown.
 * Query param: year (default current year)
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.query.year);
    return sendSuccess(res, 200, 'Monthly trends retrieved', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/weekly-trends
 * Returns week-by-week income/expense breakdown for the last N weeks.
 * Query param: weeks (default 8)
 */
const getWeeklyTrends = async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks, 10) || 8;
    const data = await dashboardService.getWeeklyTrends(weeks);
    return sendSuccess(res, 200, 'Weekly trends retrieved', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends,
};
