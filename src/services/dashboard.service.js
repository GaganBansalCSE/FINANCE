/**
 * Dashboard service – aggregated analytics over financial records.
 *
 * All aggregations exclude soft-deleted records.
 */

const FinancialRecord = require('../models/FinancialRecord');

/**
 * Get high-level summary: total income, total expenses, net balance.
 * @returns {Promise<{totalIncome, totalExpenses, netBalance}>}
 */
const getSummary = async () => {
  const [result, recordCount] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
    FinancialRecord.countDocuments({ isDeleted: false }),
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;

  result.forEach(({ _id, total }) => {
    if (_id === 'income') totalIncome = total;
    if (_id === 'expense') totalExpenses = total;
  });

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    recordCount,
  };
};

/**
 * Get totals broken down by category.
 * @returns {Promise<Array<{category, type, total}>>}
 */
const getCategoryTotals = async () => {
  return FinancialRecord.aggregate([
    { $match: { isDeleted: false, type: 'expense' } },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        amount: 1,
        count: 1,
      },
    },
    { $sort: { amount: -1 } },
  ]);
};

/**
 * Get the N most recent records.
 * @param {number} limit
 * @returns {Promise<FinancialRecord[]>}
 */
const getRecentActivity = async (limit = 10) => {
  return FinancialRecord.find({ isDeleted: false })
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(limit);
};

/**
 * Get monthly income/expense totals for a given year.
 * @param {number} year - defaults to current year
 * @returns {Promise<Array>}
 */
const getMonthlyTrends = async (year) => {
  const targetYear = year ? Number(year) : new Date().getFullYear();
  const start = new Date(`${targetYear}-01-01T00:00:00.000Z`);
  const end = new Date(`${targetYear + 1}-01-01T00:00:00.000Z`);

  const result = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { month: 1 } },
  ]);

  // Normalise into month-keyed objects for easy frontend consumption
  const months = {};
  for (let m = 1; m <= 12; m++) {
    months[m] = { month: m, income: 0, expenses: 0 };
  }
  result.forEach(({ month, type, total }) => {
    if (months[month]) {
      const key = type === 'expense' ? 'expenses' : type;
      months[month][key] = total;
    }
  });

  return Object.values(months);
};

/**
 * Get weekly income/expense totals for the last N weeks.
 * @param {number} weeks - number of weeks to look back (default 8)
 * @returns {Promise<Array>}
 */
const getWeeklyTrends = async (weeks = 8) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - weeks * 7);

  const result = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: start, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: '$date' },
          year: { $isoWeekYear: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        week: '$_id.week',
        year: '$_id.year',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { year: 1, week: 1 } },
  ]);

  // Normalise into week-keyed objects for easy frontend consumption
  const weekMap = {};
  result.forEach(({ week, year, type, total }) => {
    const key = `${year}-${week}`;
    if (!weekMap[key]) {
      weekMap[key] = { week, year, income: 0, expenses: 0 };
    }
    const field = type === 'expense' ? 'expenses' : 'income';
    weekMap[key][field] = total;
  });

  return Object.values(weekMap).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.week - b.week
  );
};

module.exports = {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends,
};
