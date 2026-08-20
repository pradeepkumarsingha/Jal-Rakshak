require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const clearDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    await mongoose.connect(mongoURI);

    logger.warn('⚠️ Clearing entire Jal Rakshak database collections...');

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      logger.info(`Cleared collection: ${key}`);
    }

    await mongoose.connection.close();
    logger.info('Database cleared successfully.');
  } catch (error) {
    logger.error(`Database clear error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  clearDatabase();
}

module.exports = clearDatabase;
