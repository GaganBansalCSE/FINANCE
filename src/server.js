/**
 * HTTP server entry point.
 * Connects to MongoDB and starts the Express server.
 */

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
  });

  // Graceful shutdown handlers
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

start();
