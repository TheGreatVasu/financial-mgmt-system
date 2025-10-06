const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  // Temporarily disabled third-party DB connection so the app can run offline
  console.log('MongoDB connection disabled (temporary offline mode).');
  return null;
};

module.exports = connectDB;
