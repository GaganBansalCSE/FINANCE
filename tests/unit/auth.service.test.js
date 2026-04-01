/**
 * Unit tests for the Auth service.
 * Mongoose User model is mocked so no database is needed.
 */

jest.mock('../../src/models/User');
jest.mock('../../src/utils/jwt');

const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/jwt');
const authService = require('../../src/services/auth.service');

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should register a new user and return user + token', async () => {
      User.findOne.mockResolvedValue(null); // no existing user

      const mockUser = {
        _id: 'user123',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'viewer',
        status: 'active',
      };
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mock.jwt.token');

      const result = await authService.register({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'alice@example.com' });
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(generateToken).toHaveBeenCalledWith('user123', 'viewer');
      expect(result.token).toBe('mock.jwt.token');
      expect(result.user.email).toBe('alice@example.com');
    });

    it('should throw 409 if email is already registered', async () => {
      User.findOne.mockResolvedValue({ email: 'alice@example.com' });

      await expect(
        authService.register({ name: 'Alice', email: 'alice@example.com', password: '123456' })
      ).rejects.toMatchObject({ message: 'Email is already registered', statusCode: 409 });

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should login with valid credentials and return token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'admin',
        status: 'active',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      // Simulate the chained .select('+password') call
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      generateToken.mockReturnValue('mock.jwt.token');

      const result = await authService.login({
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(result.token).toBe('mock.jwt.token');
      expect(result.user.role).toBe('admin');
    });

    it('should throw 401 if user is not found', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'x' })
      ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });
    });

    it('should throw 401 if password does not match', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
        status: 'active',
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.login({ email: 'a@a.com', password: 'wrong' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 403 if user is inactive', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(true),
        status: 'inactive',
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.login({ email: 'a@a.com', password: 'password123' })
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
