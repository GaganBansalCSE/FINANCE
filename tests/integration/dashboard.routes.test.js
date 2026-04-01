/**
 * Integration tests for Dashboard HTTP routes.
 * Service layer is mocked – no database required.
 *
 * Tests cover: role-based access, query parameter handling, status codes.
 */

jest.mock('../../src/services/dashboard.service');
jest.mock('../../src/models/User');

const request = require('supertest');
const app = require('../../src/app');
const dashboardService = require('../../src/services/dashboard.service');
const User = require('../../src/models/User');

const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret_key_for_tests';
process.env.NODE_ENV = 'test';

const setupUser = (role) => {
  const token = jwt.sign({ id: `${role}Id`, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  User.findById.mockResolvedValue({
    _id: `${role}Id`,
    name: `${role} User`,
    email: `${role}@example.com`,
    role,
    status: 'active',
  });
  return token;
};

describe('Dashboard Routes – HTTP layer', () => {
  afterEach(() => jest.clearAllMocks());

  // ── GET /api/dashboard/summary ─────────────────────────────────────────────
  describe('GET /api/dashboard/summary', () => {
    it('should return 200 for viewer', async () => {
      const token = setupUser('viewer');
      dashboardService.getSummary.mockResolvedValue({
        totalIncome: 8000,
        totalExpenses: 2500,
        netBalance: 5500,
      });

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.netBalance).toBe(5500);
    });

    it('should return 200 for admin', async () => {
      const token = setupUser('admin');
      dashboardService.getSummary.mockResolvedValue({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
      });
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.statusCode).toBe(401);
    });
  });

  // ── GET /api/dashboard/category-totals ────────────────────────────────────
  describe('GET /api/dashboard/category-totals', () => {
    it('should return 200 for analyst', async () => {
      const token = setupUser('analyst');
      dashboardService.getCategoryTotals.mockResolvedValue([
        { category: 'Salary', type: 'income', total: 5000, count: 1 },
      ]);

      const res = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 403 for viewer', async () => {
      const token = setupUser('viewer');

      const res = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // ── GET /api/dashboard/recent ──────────────────────────────────────────────
  describe('GET /api/dashboard/recent', () => {
    it('should return 200 for viewer with default limit', async () => {
      const token = setupUser('viewer');
      dashboardService.getRecentActivity.mockResolvedValue([{ _id: 'rec1' }]);

      const res = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(dashboardService.getRecentActivity).toHaveBeenCalledWith(10);
    });

    it('should pass custom limit to service', async () => {
      const token = setupUser('admin');
      dashboardService.getRecentActivity.mockResolvedValue([]);

      await request(app)
        .get('/api/dashboard/recent?limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(dashboardService.getRecentActivity).toHaveBeenCalledWith(5);
    });
  });

  // ── GET /api/dashboard/monthly-trends ─────────────────────────────────────
  describe('GET /api/dashboard/monthly-trends', () => {
    it('should return 200 for admin', async () => {
      const token = setupUser('admin');
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        income: 0,
        expense: 0,
      }));
      dashboardService.getMonthlyTrends.mockResolvedValue(monthlyData);

      const res = await request(app)
        .get('/api/dashboard/monthly-trends?year=2024')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(12);
    });

    it('should return 403 for viewer', async () => {
      const token = setupUser('viewer');

      const res = await request(app)
        .get('/api/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // ── GET /api/dashboard/weekly-trends ──────────────────────────────────────
  describe('GET /api/dashboard/weekly-trends', () => {
    it('should return 200 for analyst', async () => {
      const token = setupUser('analyst');
      dashboardService.getWeeklyTrends.mockResolvedValue([
        { week: 10, year: 2024, type: 'income', total: 2000 },
      ]);

      const res = await request(app)
        .get('/api/dashboard/weekly-trends?weeks=4')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('should return 403 for viewer', async () => {
      const token = setupUser('viewer');

      const res = await request(app)
        .get('/api/dashboard/weekly-trends')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
