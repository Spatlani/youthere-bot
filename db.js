const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string from Atlas
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Please make sure your MONGODB_URI environment variable is set correctly');
    // Don't exit process on error - bot can still run without DB
    console.log('Running without persistent storage...');
  }
};

module.exports = connectDB;