/**
 * Financial record service – CRUD and filtering logic.
 */

const FinancialRecord = require('../models/FinancialRecord');

/**
 * Escape special regex characters in a user-supplied string to prevent
 * ReDoS (Regular Expression Denial of Service) attacks.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a Mongoose filter object from query parameters.
 * @param {object} params - { type?, category?, startDate?, endDate?, search? }
 * @returns {object} Mongoose filter
 */
const buildFilter = ({ type, category, startDate, endDate, search } = {}) => {
  const filter = { isDeleted: false };

  if (type) filter.type = type;
  if (category) filter.category = new RegExp(escapeRegex(category), 'i');
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) {
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { category: new RegExp(escapedSearch, 'i') },
      { notes: new RegExp(escapedSearch, 'i') },
    ];
  }

  return filter;
};

/**
 * Get a paginated list of financial records.
 * @param {object} params - filter/pagination params
 * @returns {{ records, total, page, totalPages }}
 */
const getRecords = async ({
  type,
  category,
  startDate,
  endDate,
  search,
  page = 1,
  limit = 20,
  sortBy = 'date',
  sortOrder = 'desc',
} = {}) => {
  const filter = buildFilter({ type, category, startDate, endDate, search });
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a single record by ID (non-deleted).
 * @param {string} id
 * @returns {Promise<FinancialRecord>}
 */
const getRecordById = async (id) => {
  const record = await FinancialRecord.findOne({ _id: id, isDeleted: false }).populate(
    'createdBy',
    'name email'
  );
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

/**
 * Create a new financial record.
 * @param {object} data - record fields
 * @param {string} userId - ID of the creating user
 * @returns {Promise<FinancialRecord>}
 */
const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, createdBy: userId });
  return FinancialRecord.findById(record._id).populate('createdBy', 'name email');
};

/**
 * Update an existing record.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<FinancialRecord>}
 */
const updateRecord = async (id, updates) => {
  const filtered = {};

  // Explicitly cast each allowed field to its expected type to prevent
  // NoSQL injection via object payloads
  if (updates.amount !== undefined) filtered.amount = Number(updates.amount);
  if (updates.type !== undefined) filtered.type = String(updates.type);
  if (updates.category !== undefined) filtered.category = String(updates.category);
  if (updates.date !== undefined) filtered.date = new Date(updates.date);
  if (updates.notes !== undefined) filtered.notes = String(updates.notes);
  if (updates.paymentMethod !== undefined) filtered.paymentMethod = String(updates.paymentMethod);

  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    filtered,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

/**
 * Soft-delete a record (sets isDeleted=true and records deletedAt timestamp).
 * @param {string} id
 */
const deleteRecord = async (id) => {
  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};
