/**
 * Express application setup.
 * Exported separately from server.js so integration tests can import it
 * without triggering a live database connection or port binding.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// General API rate limiter – 100 requests per 15 minutes per IP
// Auth routes apply their own stricter limiter (30 req / 15 min) on top.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use(cors());
app.use(express.json());
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Finance API is running', timestamp: new Date() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
