require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

const demoUsers = [
  {
    fullName: 'Ramesh Mohanty',
    email: 'ramesh.citizen@jalrakshak.org',
    password: 'password123',
    role: 'citizen',
    phone: '+91 98612 34567',
    district: 'Cuttack',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [85.8621, 20.4782],
      address: 'Bidanasi, Cuttack',
    },
    familyMembers: 4,
  },
  {
    fullName: 'Dr. Anita Sharma (IAS)',
    email: 'anita.src@odisha.gov.in',
    password: 'password123',
    role: 'admin',
    phone: '+91 674 2534100',
    district: 'State Disaster Ops Center',
    designation: 'Special Relief Commissioner (SRC)',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [85.8245, 20.2961],
      address: 'Secretariat, Bhubaneswar',
    },
  },
  {
    fullName: 'Cmdr. Vikram Rathore',
    email: 'vikram.ndrf@gov.in',
    password: 'password123',
    role: 'rescue',
    unitId: 'TEAM-NDRF-07',
    phone: '+91 98110 54321',
    battalion: '03rd NDRF Battalion, Mundali',
    state: 'Odisha',
    location: {
      type: 'Point',
      coordinates: [85.861, 20.482],
      address: 'Mundali Basecamp, Cuttack',
    },
  },
];

const seedUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    await mongoose.connect(mongoURI);

    logger.info('Connected to MongoDB for user seeding...');

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        logger.info(`Seeded user: ${u.email} [${u.role}] (password: password123)`);
      } else {
        logger.info(`User ${u.email} already exists.`);
      }
    }

    await mongoose.connection.close();
    logger.info('User seed completed.');
  } catch (error) {
    logger.error(`User seed error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
