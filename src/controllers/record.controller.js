/**
 * Financial record controller – handles HTTP layer for CRUD operations.
 */

const recordService = require('../services/record.service');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/records
 * List records with filtering and pagination.
 * Query params: type, category, startDate, endDate, search, page, limit, sortBy, sortOrder
 */
const getRecords = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, page, limit, sortBy, sortOrder } =
      req.query;
    const result = await recordService.getRecords({
      type,
      category,
      startDate,
      endDate,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    return sendSuccess(res, 200, 'Records retrieved', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/records/:id
 * Get a single record by ID.
 */
const getRecord = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return sendSuccess(res, 200, 'Record retrieved', record);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/records
 * Create a new financial record. Admin and Analyst only.
 */
const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    return sendSuccess(res, 201, 'Record created', record);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/records/:id
 * Update an existing record. Admin only.
 */
const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    return sendSuccess(res, 200, 'Record updated', record);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/records/:id
 * Soft-delete a record. Admin only.
 */
const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    return sendSuccess(res, 200, 'Record deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, deleteRecord };
