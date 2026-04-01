/**
 * Integration tests for Financial Record HTTP routes.
 * Service layer is mocked – no database required.
 *
 * Tests cover: access control per role, validation, status codes.
 */

jest.mock('../../src/services/record.service');
jest.mock('../../src/models/User');

const request = require('supertest');
const app = require('../../src/app');
const recordService = require('../../src/services/record.service');
const User = require('../../src/models/User');

const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret_key_for_tests';
process.env.NODE_ENV = 'test';

// Helper to create a token and stub the User.findById lookup
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

const mockRecord = {
  _id: 'rec123',
  amount: 1000,
  type: 'income',
  category: 'Salary',
  date: new Date().toISOString(),
  notes: 'Test',
  createdBy: { name: 'Admin', email: 'admin@example.com' },
  isDeleted: false,
};

const validCreatePayload = { amount: 1000, type: 'income', category: 'Salary' };

describe('Record Routes – HTTP layer', () => {
  afterEach(() => jest.clearAllMocks());

  // ── GET /api/records ───────────────────────────────────────────────────────
  describe('GET /api/records', () => {
    it('should return 200 for viewer role', async () => {
      const token = setupUser('viewer');
      recordService.getRecords.mockResolvedValue({
        records: [mockRecord],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.records).toHaveLength(1);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/records');
      expect(res.statusCode).toBe(401);
    });

    it('should return 422 for invalid type filter', async () => {
      const token = setupUser('admin');
      const res = await request(app)
        .get('/api/records?type=invalid')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(422);
    });
  });

  // ── POST /api/records ──────────────────────────────────────────────────────
  describe('POST /api/records', () => {
    it('should return 201 for admin', async () => {
      const token = setupUser('admin');
      recordService.createRecord.mockResolvedValue(mockRecord);

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send(validCreatePayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.category).toBe('Salary');
    });

    it('should return 201 for analyst', async () => {
      const token = setupUser('analyst');
      recordService.createRecord.mockResolvedValue(mockRecord);

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send(validCreatePayload);

      expect(res.statusCode).toBe(201);
    });

    it('should return 403 for viewer', async () => {
      const token = setupUser('viewer');

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send(validCreatePayload);

      expect(res.statusCode).toBe(403);
      expect(recordService.createRecord).not.toHaveBeenCalled();
    });

    it('should return 422 for missing amount', async () => {
      const token = setupUser('admin');
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'income', category: 'Salary' });
      expect(res.statusCode).toBe(422);
    });

    it('should return 422 for invalid type value', async () => {
      const token = setupUser('admin');
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100, type: 'transfer', category: 'X' });
      expect(res.statusCode).toBe(422);
    });

    it('should return 422 for zero amount', async () => {
      const token = setupUser('admin');
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 0, type: 'income', category: 'X' });
      expect(res.statusCode).toBe(422);
    });
  });

  // ── GET /api/records/:id ───────────────────────────────────────────────────
  describe('GET /api/records/:id', () => {
    it('should return 200 for viewer', async () => {
      const token = setupUser('viewer');
      recordService.getRecordById.mockResolvedValue(mockRecord);

      const res = await request(app)
        .get('/api/records/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('should return 422 for invalid MongoDB ID format', async () => {
      const token = setupUser('viewer');
      const res = await request(app)
        .get('/api/records/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(422);
    });

    it('should return 404 when service throws 404', async () => {
      const token = setupUser('admin');
      const err = new Error('Record not found');
      err.statusCode = 404;
      recordService.getRecordById.mockRejectedValue(err);

      const res = await request(app)
        .get('/api/records/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  // ── PATCH /api/records/:id ─────────────────────────────────────────────────
  describe('PATCH /api/records/:id', () => {
    it('should return 200 for admin', async () => {
      const token = setupUser('admin');
      recordService.updateRecord.mockResolvedValue({ ...mockRecord, amount: 2000 });

      const res = await request(app)
        .patch('/api/records/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 2000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.amount).toBe(2000);
    });

    it('should return 403 for analyst', async () => {
      const token = setupUser('analyst');

      const res = await request(app)
        .patch('/api/records/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 2000 });

      expect(res.statusCode).toBe(403);
    });
  });

  // ── DELETE /api/records/:id ────────────────────────────────────────────────
  describe('DELETE /api/records/:id', () => {
    it('should return 200 for admin', async () => {
      const token = setupUser('admin');
      recordService.deleteRecord.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/records/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });

    it('should return 403 for viewer', async () => {
      const token = setupUser('viewer');

      const res = await request(app)
        .delete('/api/records/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
