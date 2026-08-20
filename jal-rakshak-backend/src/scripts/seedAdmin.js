require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    const adminEmail = 'admin@demo.jalrakshak.org';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      existing.password = 'Admin@123';
      existing.role = 'admin';
      existing.fullName = 'Dr. Anita Sharma (IAS)';
      existing.phone = '+91 674 2534100';
      existing.district = 'State Disaster Ops Center';
      existing.designation = 'Special Relief Commissioner (SRC)';
      existing.state = 'Odisha';
      existing.location = {
        type: 'Point',
        coordinates: [85.8245, 20.2961],
        address: 'State Disaster Ops Center, Bhubaneswar',
      };
      await existing.save();
      logger.info(`Updated demo admin account: ${adminEmail}`);
    } else {
      await User.create({
        fullName: 'Dr. Anita Sharma (IAS)',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 674 2534100',
        district: 'State Disaster Ops Center',
        designation: 'Special Relief Commissioner (SRC)',
        state: 'Odisha',
        location: {
          type: 'Point',
          coordinates: [85.8245, 20.2961],
          address: 'State Disaster Ops Center, Bhubaneswar',
        },
        isVerified: true,
        isActive: true,
      });
      logger.info(`Created demo admin account: ${adminEmail} (Password: Admin@123)`);
    }

    if (require.main === module) {
      await mongoose.connection.close();
      logger.info('Admin seed completed.');
    }
  } catch (error) {
    logger.error(`Admin seed error: ${error.message}`);
    if (require.main === module) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
