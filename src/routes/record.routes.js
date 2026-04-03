/**
 * Financial record routes
 *
 * GET    /api/records        – All roles (viewer, analyst, admin)
 * GET    /api/records/:id    – All roles
 * POST   /api/records        – Admin only
 * PATCH  /api/records/:id   – Admin only
 * DELETE /api/records/:id   – Admin only
 */

const express = require('express');
const router = express.Router();

const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/record.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createRecordRules,
  updateRecordRules,
  recordIdRule,
  listRecordsRules,
} = require('../validators/record.validator');

// All record routes require authentication
router.use(protect);

// @route   GET /api/records
// @desc    List records with filtering and pagination
// @access  Viewer, Analyst, Admin
router.get('/', listRecordsRules, validate, getRecords);

// @route   GET /api/records/:id
// @desc    Get a single record
// @access  Viewer, Analyst, Admin
router.get('/:id', recordIdRule, validate, getRecord);

// @route   POST /api/records
// @desc    Create a financial record
// @access  Admin
router.post('/', authorize('admin'), createRecordRules, validate, createRecord);

// @route   PATCH /api/records/:id
// @desc    Update a financial record
// @access  Admin
router.patch('/:id', authorize('admin'), updateRecordRules, validate, updateRecord);

// @route   DELETE /api/records/:id
// @desc    Soft-delete a financial record
// @access  Admin
router.delete('/:id', authorize('admin'), recordIdRule, validate, deleteRecord);

module.exports = router;
