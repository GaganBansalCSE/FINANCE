/**
 * Request validation middleware.
 *
 * Runs after express-validator check() chains and returns a
 * 422 response with all validation errors if any exist.
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return sendError(res, 422, 'Validation error', messages);
  }
  next();
};

module.exports = validate;
