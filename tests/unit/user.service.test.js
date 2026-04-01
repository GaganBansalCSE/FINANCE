/**
 * Unit tests for the User service.
 * Mongoose User model is mocked so no database is needed.
 */

jest.mock('../../src/models/User');

const User = require('../../src/models/User');
const userService = require('../../src/services/user.service');

// Chainable Mongoose query mock helper
const chainableMock = (resolved) => ({
  select: jest.fn().mockResolvedValue(resolved),
});

describe('User Service', () => {
  afterEach(() => jest.clearAllMocks());

  const mockUser = {
    _id: 'abc123',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'analyst',
    status: 'active',
  };

  // ── getAllUsers ────────────────────────────────────────────────────────────
  describe('getAllUsers()', () => {
    it('should return all users', async () => {
      User.find.mockReturnValue(chainableMock([mockUser]));
      const users = await userService.getAllUsers();
      expect(users).toEqual([mockUser]);
      expect(User.find).toHaveBeenCalledWith({});
    });

    it('should filter by role', async () => {
      User.find.mockReturnValue(chainableMock([mockUser]));
      await userService.getAllUsers({ role: 'analyst' });
      expect(User.find).toHaveBeenCalledWith({ role: 'analyst' });
    });

    it('should filter by status', async () => {
      User.find.mockReturnValue(chainableMock([]));
      await userService.getAllUsers({ status: 'inactive' });
      expect(User.find).toHaveBeenCalledWith({ status: 'inactive' });
    });
  });

  // ── getUserById ────────────────────────────────────────────────────────────
  describe('getUserById()', () => {
    it('should return a user by ID', async () => {
      User.findById.mockReturnValue(chainableMock(mockUser));
      const user = await userService.getUserById('abc123');
      expect(user).toEqual(mockUser);
    });

    it('should throw 404 if user not found', async () => {
      User.findById.mockReturnValue(chainableMock(null));
      await expect(userService.getUserById('notfound')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  // ── createUser ────────────────────────────────────────────────────────────
  describe('createUser()', () => {
    it('should create and return a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: 'newId' });
      User.findById.mockReturnValue(chainableMock(mockUser));

      const user = await userService.createUser({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'pass123',
        role: 'analyst',
      });

      expect(User.create).toHaveBeenCalledTimes(1);
      expect(user).toEqual(mockUser);
    });

    it('should throw 409 for duplicate email', async () => {
      User.findOne.mockResolvedValue({ email: 'bob@example.com' });
      await expect(
        userService.createUser({ name: 'X', email: 'bob@example.com', password: '123456' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ── updateUser ────────────────────────────────────────────────────────────
  describe('updateUser()', () => {
    it('should update and return the user', async () => {
      const updated = { ...mockUser, role: 'admin' };
      User.findByIdAndUpdate.mockReturnValue(chainableMock(updated));

      const result = await userService.updateUser('abc123', { role: 'admin' });
      expect(result.role).toBe('admin');
    });

    it('should throw 404 if user not found', async () => {
      User.findByIdAndUpdate.mockReturnValue(chainableMock(null));
      await expect(userService.updateUser('notfound', { role: 'admin' })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should only update allowed fields', async () => {
      User.findByIdAndUpdate.mockReturnValue(chainableMock(mockUser));
      await userService.updateUser('abc123', {
        name: 'New Name',
        role: 'admin',
        status: 'inactive',
        password: 'shouldbeignored', // not allowed
        email: 'shouldbeignored@x.com', // not allowed
      });

      const callArgs = User.findByIdAndUpdate.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('password');
      expect(callArgs).not.toHaveProperty('email');
      expect(callArgs).toHaveProperty('name', 'New Name');
    });
  });

  // ── deleteUser ────────────────────────────────────────────────────────────
  describe('deleteUser()', () => {
    it('should delete a user', async () => {
      User.findByIdAndDelete.mockResolvedValue(mockUser);
      await expect(userService.deleteUser('abc123')).resolves.toBeUndefined();
    });

    it('should throw 404 if user not found', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);
      await expect(userService.deleteUser('notfound')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
