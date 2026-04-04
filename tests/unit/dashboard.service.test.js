/**
 * Unit tests for the Dashboard service.
 * Mongoose FinancialRecord model is mocked so no database is needed.
 */

jest.mock('../../src/models/FinancialRecord');

const FinancialRecord = require('../../src/models/FinancialRecord');
const dashboardService = require('../../src/services/dashboard.service');

describe('Dashboard Service', () => {
  afterEach(() => jest.clearAllMocks());

  // ── getSummary ─────────────────────────────────────────────────────────────
  describe('getSummary()', () => {
    it('should calculate total income, expenses, net balance, and record count', async () => {
      FinancialRecord.aggregate.mockResolvedValue([
        { _id: 'income', total: 8000 },
        { _id: 'expense', total: 2500 },
      ]);
      FinancialRecord.countDocuments.mockResolvedValue(10);

      const result = await dashboardService.getSummary();

      expect(result.totalIncome).toBe(8000);
      expect(result.totalExpenses).toBe(2500);
      expect(result.netBalance).toBe(5500);
      expect(result.recordCount).toBe(10);
    });

    it('should return zeros when no records exist', async () => {
      FinancialRecord.aggregate.mockResolvedValue([]);
      FinancialRecord.countDocuments.mockResolvedValue(0);

      const result = await dashboardService.getSummary();

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netBalance).toBe(0);
      expect(result.recordCount).toBe(0);
    });

    it('should handle only income records', async () => {
      FinancialRecord.aggregate.mockResolvedValue([{ _id: 'income', total: 5000 }]);
      FinancialRecord.countDocuments.mockResolvedValue(3);

      const result = await dashboardService.getSummary();
      expect(result.totalIncome).toBe(5000);
      expect(result.totalExpenses).toBe(0);
      expect(result.netBalance).toBe(5000);
      expect(result.recordCount).toBe(3);
    });
  });

  // ── getCategoryTotals ──────────────────────────────────────────────────────
  describe('getCategoryTotals()', () => {
    it('should return expense category totals with amount field', async () => {
      const mockData = [
        { category: 'Rent', amount: 1500, count: 1 },
        { category: 'Food', amount: 800, count: 3 },
      ];
      FinancialRecord.aggregate.mockResolvedValue(mockData);

      const result = await dashboardService.getCategoryTotals();

      expect(result).toEqual(mockData);
      expect(FinancialRecord.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  // ── getRecentActivity ──────────────────────────────────────────────────────
  describe('getRecentActivity()', () => {
    it('should return recent records with default limit 10', async () => {
      const mockRecords = Array.from({ length: 5 }, (_, i) => ({ _id: `rec${i}` }));

      // Build chainable mock
      const limitMock = jest.fn().mockResolvedValue(mockRecords);
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      FinancialRecord.find.mockReturnValue({ populate: populateMock });

      const result = await dashboardService.getRecentActivity();

      expect(limitMock).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockRecords);
    });

    it('should respect custom limit', async () => {
      const limitMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      FinancialRecord.find.mockReturnValue({ populate: populateMock });

      await dashboardService.getRecentActivity(3);
      expect(limitMock).toHaveBeenCalledWith(3);
    });
  });

  // ── getMonthlyTrends ───────────────────────────────────────────────────────
  describe('getMonthlyTrends()', () => {
    it('should return 12 months of data even with sparse results', async () => {
      FinancialRecord.aggregate.mockResolvedValue([
        { month: 1, type: 'income', total: 5000 },
        { month: 1, type: 'expense', total: 1500 },
        { month: 3, type: 'income', total: 3000 },
      ]);

      const result = await dashboardService.getMonthlyTrends(2024);

      expect(result).toHaveLength(12);

      const jan = result.find((m) => m.month === 1);
      expect(jan.income).toBe(5000);
      expect(jan.expenses).toBe(1500);

      const feb = result.find((m) => m.month === 2);
      expect(feb.income).toBe(0);
      expect(feb.expenses).toBe(0);

      const mar = result.find((m) => m.month === 3);
      expect(mar.income).toBe(3000);
    });
  });

  // ── getWeeklyTrends ────────────────────────────────────────────────────────
  describe('getWeeklyTrends()', () => {
    it('should return aggregation result directly', async () => {
      const mockWeeks = [
        { week: 10, year: 2024, type: 'income', total: 2000 },
        { week: 11, year: 2024, type: 'expense', total: 500 },
      ];
      FinancialRecord.aggregate.mockResolvedValue(mockWeeks);

      const result = await dashboardService.getWeeklyTrends(4);
      expect(result).toEqual(mockWeeks);
    });
  });
});
