require('dotenv').config();
const mongoose = require('mongoose');

const testAtlasConnection = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'No MONGODB_URI found');

  if (!uri || uri.includes('localhost:27017')) {
    console.log('\n⚠️ Notice: MONGODB_URI is currently set to localhost.');
    console.log('To connect to MongoDB Atlas, replace MONGODB_URI in jal-rakshak-backend/.env with:');
    console.log('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/jalrakshak?retryWrites=true&w=majority\n');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Successfully connected to MongoDB Database!');
    console.log('Host:', conn.connection.host);
    console.log('Database Name:', conn.connection.name);
    console.log('Collections:');
    const collections = await conn.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('  (No collections yet. Run "npm run seed:all" to populate demo data)');
    } else {
      collections.forEach(c => console.log('  -', c.name));
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting tips for MongoDB Atlas:');
    console.log('1. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access from Anywhere 0.0.0.0/0 for testing)');
    console.log('2. Ensure your Database User username and password are correct (Database Access -> Database Users)');
    console.log('3. Ensure special characters in password are URL-encoded (e.g., @ becomes %40)');
    process.exit(1);
  }
};

testAtlasConnection();
