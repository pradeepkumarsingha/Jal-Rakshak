const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  try {
    // Priority 1: Use In-Memory MongoDB Server for isolated, safe testing
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
      }
      return;
    } catch (memErr) {
      // Priority 2: Fallback to local test database only (NEVER connect to Atlas/production)
      const testUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/jalrakshak_test';
      if (testUri.includes('mongodb+srv') || testUri.includes('.mongodb.net')) {
        console.warn('⚠️ Tests aborted connecting to MongoDB Atlas to prevent accidental data deletion.');
        return;
      }
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(testUri, { serverSelectionTimeoutMS: 3000 });
      }
    }
  } catch (err) {
    console.warn('Local MongoDB not running for tests. Endpoints with DB fallback will be tested.');
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (e) {
    // ignore
  }
});

afterEach(async () => {
  try {
    // Only clean collections if connected to an in-memory or localhost test database
    if (mongoose.connection.readyState === 1) {
      const uri = mongoose.connection.host || '';
      const name = mongoose.connection.name || '';
      // Strict safety check: Never wipe Atlas or non-test databases
      if (uri.includes('mongodb.net') || name === 'jalrakshak') {
        return;
      }
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  } catch (e) {
    // ignore
  }
});

