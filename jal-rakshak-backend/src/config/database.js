const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose.connection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    
    if (!mongoURI) {
      logger.warn('MONGODB_URI is not set in environment variables.');
      return null;
    }

    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    const isAtlas = mongoURI.includes('mongodb+srv') || mongoURI.includes('.mongodb.net');
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: isAtlas ? 10000 : 5000,
    });

    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected.');
    });

    return conn;
  } catch (error) {
    logger.warn(`MongoDB connection notice: ${error.message}.`);
    return null;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
    }
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
