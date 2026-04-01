/**
 * Unit tests for the Financial Record service.
 * Mongoose FinancialRecord model is mocked so no database is needed.
 */

jest.mock('../../src/models/FinancialRecord');

const FinancialRecord = require('../../src/models/FinancialRecord');
const recordService = require('../../src/services/record.service');

// Build a chainable mock that mimics Mongoose query builder
const buildQueryMock = (resolved) => {
  const mock = {
    populate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
  };
  mock.populate.mockReturnValue(mock);
  mock.sort.mockReturnValue(mock);
  mock.skip.mockReturnValue(mock);
  mock.limit.mockImplementation(() => Promise.resolve(resolved));
  return mock;
};

const singleQueryMock = (resolved) => ({
  populate: jest.fn().mockResolvedValue(resolved),
});

describe('Record Service', () => {
  afterEach(() => jest.clearAllMocks());

  const mockRecord = {
    _id: 'rec123',
    amount: 1000,
    type: 'income',
    category: 'Salary',
    date: new Date('2024-01-15'),
    notes: 'Monthly salary',
    createdBy: 'user123',
    isDeleted: false,
  };

  // ── getRecords ────────────────────────────────────────────────────────────
  describe('getRecords()', () => {
    it('should return paginated records', async () => {
      FinancialRecord.find.mockReturnValue(buildQueryMock([mockRecord]));
      FinancialRecord.countDocuments.mockResolvedValue(1);

      const result = await recordService.getRecords({ page: 1, limit: 10 });

      expect(result.records).toEqual([mockRecord]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply type filter', async () => {
      FinancialRecord.find.mockReturnValue(buildQueryMock([]));
      FinancialRecord.countDocuments.mockResolvedValue(0);

      await recordService.getRecords({ type: 'expense' });

      const filterArg = FinancialRecord.find.mock.calls[0][0];
      expect(filterArg.type).toBe('expense');
      expect(filterArg.isDeleted).toBe(false);
    });

    it('should apply date range filter', async () => {
      FinancialRecord.find.mockReturnValue(buildQueryMock([]));
      FinancialRecord.countDocuments.mockResolvedValue(0);

      await recordService.getRecords({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      const filterArg = FinancialRecord.find.mock.calls[0][0];
      expect(filterArg.date).toHaveProperty('$gte');
      expect(filterArg.date).toHaveProperty('$lte');
    });
  });

  // ── getRecordById ──────────────────────────────────────────────────────────
  describe('getRecordById()', () => {
    it('should return a record by ID', async () => {
      FinancialRecord.findOne.mockReturnValue(singleQueryMock(mockRecord));
      const record = await recordService.getRecordById('rec123');
      expect(record).toEqual(mockRecord);
    });

    it('should throw 404 for non-existent record', async () => {
      FinancialRecord.findOne.mockReturnValue(singleQueryMock(null));
      await expect(recordService.getRecordById('notfound')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── createRecord ───────────────────────────────────────────────────────────
  describe('createRecord()', () => {
    it('should create and return a record', async () => {
      FinancialRecord.create.mockResolvedValue({ _id: 'new123' });
      FinancialRecord.findById.mockReturnValue(singleQueryMock(mockRecord));

      const result = await recordService.createRecord(
        { amount: 1000, type: 'income', category: 'Salary' },
        'user123'
      );

      expect(FinancialRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 'user123' })
      );
      expect(result).toEqual(mockRecord);
    });
  });

  // ── updateRecord ───────────────────────────────────────────────────────────
  describe('updateRecord()', () => {
    it('should update and return the record', async () => {
      const updated = { ...mockRecord, amount: 2000 };
      FinancialRecord.findOneAndUpdate.mockReturnValue(singleQueryMock(updated));

      const result = await recordService.updateRecord('rec123', { amount: 2000 });
      expect(result.amount).toBe(2000);
    });

    it('should throw 404 if record not found', async () => {
      FinancialRecord.findOneAndUpdate.mockReturnValue(singleQueryMock(null));
      await expect(recordService.updateRecord('notfound', { amount: 1 })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should only update allowed fields', async () => {
      FinancialRecord.findOneAndUpdate.mockReturnValue(singleQueryMock(mockRecord));
      await recordService.updateRecord('rec123', {
        amount: 500,
        createdBy: 'hackedUser', // should be ignored
        isDeleted: true, // should be ignored
      });

      const updateArg = FinancialRecord.findOneAndUpdate.mock.calls[0][1];
      expect(updateArg).not.toHaveProperty('createdBy');
      expect(updateArg).not.toHaveProperty('isDeleted');
      expect(updateArg).toHaveProperty('amount', 500);
    });
  });

  // ── deleteRecord ───────────────────────────────────────────────────────────
  describe('deleteRecord()', () => {
    it('should soft-delete a record', async () => {
      FinancialRecord.findOneAndUpdate.mockResolvedValue({ ...mockRecord, isDeleted: true });
      await expect(recordService.deleteRecord('rec123')).resolves.toBeUndefined();

      // Verify it sets isDeleted=true and records deletedAt
      const updateArg = FinancialRecord.findOneAndUpdate.mock.calls[0][1];
      expect(updateArg.isDeleted).toBe(true);
      expect(updateArg.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw 404 if record not found or already deleted', async () => {
      FinancialRecord.findOneAndUpdate.mockResolvedValue(null);
      await expect(recordService.deleteRecord('notfound')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
