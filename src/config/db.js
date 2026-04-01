/**
 * MongoDB connection configuration using Mongoose.
 * Reads the connection URI from environment variables.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Exits the process if the connection fails (critical startup error).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
