/**
 * Root-level entry point for running the full-stack app locally.
 *
 * Starts the Express API (src/app.js) and, when a production React build is
 * present in frontend/dist, also serves the SPA so that a single `node server.js`
 * (or `nodemon server.js`) powers both the backend and the frontend.
 *
 * Usage:
 *   node server.js          – production / local full-stack
 *   nodemon server.js       – development with auto-restart
 *
 * The "/*path" wildcard syntax (named wildcard) is required by Express 5's
 * updated path-to-regexp; the bare "*" or "/*" patterns used in Express 4
 * throw a PathError at startup.
 */

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// ── Serve the React build when it exists ──────────────────────────────────────
const frontendDist = path.join(__dirname, 'frontend', 'dist');

if (fs.existsSync(frontendDist)) {
  const express = require('express');
  const rateLimit = require('express-rate-limit');

  // Serve static assets (JS, CSS, images …)
  app.use(express.static(frontendDist));

  // Rate-limiter for the SPA catch-all (mirrors the global limiter in app.js).
  // Express already runs app.use(globalLimiter) before this route, but the
  // explicit limiter here makes the protection clear for static-analysis tools.
  const spaLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  });

  // Catch-all: send index.html for every non-API route so that client-side
  // routing (React Router) works on page refresh / direct URL access.
  //
  // "/*path" is the Express 5-compatible named wildcard – do NOT use bare "*"
  // or "/*" which are rejected by path-to-regexp v8+ with PathError.
  app.get('/*path', spaLimiter, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ── Connect to MongoDB and start the HTTP server ──────────────────────────────
const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
  });

  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully…`);
    server.close(() => {
      mongoose.connection.close().then(() => {
        console.log('MongoDB connection closed.');
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
