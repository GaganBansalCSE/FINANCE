/**
 * Integration tests for Auth HTTP routes.
 * Service layer is mocked – no database required.
 *
 * Tests cover: input validation, correct status codes, auth middleware.
 */

jest.mock('../../src/services/auth.service');
jest.mock('../../src/models/User');

const request = require('supertest');
const app = require('../../src/app');
const authService = require('../../src/services/auth.service');
const User = require('../../src/models/User');

// A valid JWT signed with the test secret (7-day expiry)
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret_key_for_tests';
process.env.NODE_ENV = 'test';

const makeToken = (payload = {}) =>
  jwt.sign({ id: 'user123', role: 'admin', ...payload }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

describe('Auth Routes – HTTP layer', () => {
  afterEach(() => jest.clearAllMocks());

  // ── POST /api/auth/register ───────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    const validPayload = { name: 'Alice', email: 'alice@example.com', password: 'pass123' };

    it('should return 201 when service succeeds', async () => {
      authService.register.mockResolvedValue({
        user: { id: '1', name: 'Alice', email: 'alice@example.com', role: 'viewer', status: 'active' },
        token: 'jwt.token.here',
      });

      const res = await request(app).post('/api/auth/register').send(validPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe('jwt.token.here');
    });

    it('should return 409 when email is already registered', async () => {
      const err = new Error('Email is already registered');
      err.statusCode = 409;
      authService.register.mockRejectedValue(err);

      const res = await request(app).post('/api/auth/register').send(validPayload);
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@a.com', password: 'pass123' });
      expect(res.statusCode).toBe(422);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'X', email: 'not-an-email', password: 'pass123' });
      expect(res.statusCode).toBe(422);
    });

    it('should return 422 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'X', email: 'x@x.com', password: '123' });
      expect(res.statusCode).toBe(422);
    });
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should return 200 and token on valid login', async () => {
      authService.login.mockResolvedValue({
        user: { id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin', status: 'active' },
        token: 'jwt.token',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'pass123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBe('jwt.token');
    });

    it('should return 401 for invalid credentials', async () => {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      authService.login.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'x@x.com', password: 'wrong' });

      expect(res.statusCode).toBe(401);
    });

    it('should return 422 for missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(422);
    });
  });

  // ── GET /api/auth/me ──────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return 401 without Authorization header', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 for an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token');
      expect(res.statusCode).toBe(401);
    });

    it('should return 200 with a valid token when user exists', async () => {
      const token = makeToken({ id: 'user123', role: 'admin' });

      User.findById.mockResolvedValue({
        _id: 'user123',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'admin',
        status: 'active',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('alice@example.com');
    });

    it('should return 401 when user no longer exists', async () => {
      const token = makeToken({ id: 'deletedUser', role: 'admin' });
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(401);
    });
  });
});
