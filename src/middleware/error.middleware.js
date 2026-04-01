/**
 * Global error-handling middleware.
 *
 * Catches all errors forwarded via next(err) and returns a
 * consistent JSON error response.  Mongoose validation and
 * cast errors are translated into user-friendly messages.
 */

const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId (e.g. /records/not-an-id)
  if (err.name === 'CastError') {
    message = `Resource not found: invalid value for field '${err.path}'`;
    statusCode = 400;
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value: '${err.keyValue[field]}' already exists for field '${field}'`;
    statusCode = 409;
  }

  // Mongoose validation errors (required fields, enum, min/max)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
    return sendError(res, 400, message, errors);
  }

  // Log unexpected server errors (not exposed to client)
  if (statusCode === 500) {
    console.error('Server Error:', err);
  }

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
