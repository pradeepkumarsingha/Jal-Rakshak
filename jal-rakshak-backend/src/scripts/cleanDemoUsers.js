require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const cleanDemoUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);

    const demoEmails = [
      'ramesh.citizen@jalrakshak.org',
      'anita.src@odisha.gov.in',
      'vikram.ndrf@gov.in',
      'citizen@demo.jalrakshak.org',
      'admin@demo.jalrakshak.org',
      'rescue@demo.jalrakshak.org',
    ];

    const result = await mongoose.connection.db.collection('users').deleteMany({
      email: { $in: demoEmails },
    });

    logger.info(`✅ Successfully deleted ${result.deletedCount} demo user(s) from database.`);
    
    const remaining = await mongoose.connection.db.collection('users').find({}).toArray();
    logger.info(`Remaining actual users in database: ${remaining.length}`);
    remaining.forEach((u) => logger.info(`- ${u.fullName} (${u.email}) [Role: ${u.role}]`));

    await mongoose.connection.close();
  } catch (error) {
    logger.error(`Error cleaning demo users: ${error.message}`);
    process.exit(1);
  }
};

cleanDemoUsers();
