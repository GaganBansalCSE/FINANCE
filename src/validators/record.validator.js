/**
 * Validation rules for financial record routes.
 */

const { body, param, query } = require('express-validator');

const createRecordRules = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category must be at most 100 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters'),

  body('paymentMethod')
    .optional()
    .isIn(['Credit Card', 'Debit Card', 'UPI', 'NEFT', 'CASH'])
    .withMessage('Payment method must be one of: Credit Card, Debit Card, UPI, NEFT, CASH'),
];

const updateRecordRules = [
  param('id').isMongoId().withMessage('Invalid record ID'),

  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be at most 100 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be at most 500 characters'),

  body('paymentMethod')
    .optional()
    .isIn(['Credit Card', 'Debit Card', 'UPI', 'NEFT', 'CASH'])
    .withMessage('Payment method must be one of: Credit Card, Debit Card, UPI, NEFT, CASH'),
];

const recordIdRule = [
  param('id').isMongoId().withMessage('Invalid record ID'),
];

const listRecordsRules = [
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type filter must be income or expense'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createRecordRules,
  updateRecordRules,
  recordIdRule,
  listRecordsRules,
};
