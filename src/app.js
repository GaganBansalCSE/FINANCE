/**
 * Express application setup.
 *
 * Kept separate from server.js so the app can be imported
 * by the test suite without starting the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const swaggerSpec = require('./docs/swagger');

const app = express();

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors());

// ── Request logging (disabled in test mode to keep output clean) ───────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Global rate limiter ────────────────────────────────────────────────────
// 100 requests per 15 minutes per IP (values overridable via env)
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/register attempts. Please try again in 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── API documentation ──────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Finance API is running', timestamp: new Date() });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
