require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

const seedCitizen = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    const citizenEmail = 'citizen@demo.jalrakshak.org';
    const existing = await User.findOne({ email: citizenEmail });

    if (existing) {
      existing.password = 'Citizen@123';
      existing.role = 'citizen';
      existing.fullName = 'Ramesh Mohanty';
      existing.phone = '+919876543210';
      existing.district = 'Cuttack';
      existing.state = 'Odisha';
      existing.location = {
        type: 'Point',
        coordinates: [85.8830, 20.4625],
        address: 'Near Naraj, Cuttack, Odisha',
      };
      await existing.save();
      logger.info(`Updated demo citizen account: ${citizenEmail}`);
    } else {
      await User.create({
        fullName: 'Ramesh Mohanty',
        email: citizenEmail,
        password: 'Citizen@123',
        role: 'citizen',
        phone: '+919876543210',
        district: 'Cuttack',
        state: 'Odisha',
        location: {
          type: 'Point',
          coordinates: [85.8830, 20.4625],
          address: 'Near Naraj, Cuttack, Odisha',
        },
        isVerified: true,
        isActive: true,
      });
      logger.info(`Created demo citizen account: ${citizenEmail} (Password: Citizen@123)`);
    }

    if (require.main === module) {
      await mongoose.connection.close();
      logger.info('Citizen seed completed.');
    }
  } catch (error) {
    logger.error(`Citizen seed error: ${error.message}`);
    if (require.main === module) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedCitizen();
}

module.exports = seedCitizen;
