require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const RescueTeam = require('../models/RescueTeam');
const logger = require('../utils/logger');

const seedRescue = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jalrakshak';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI);
    }

    const rescueEmail = 'rescue@demo.jalrakshak.org';
    const existing = await User.findOne({ email: rescueEmail });

    let rescueUser;
    if (existing) {
      existing.password = 'Rescue@123';
      existing.role = 'rescue';
      existing.fullName = 'Cmdr. Vikram Rathore';
      existing.phone = '+91 98110 54321';
      existing.unitId = 'NDRF-BN-03';
      existing.battalion = '03rd NDRF Battalion, Mundali';
      existing.state = 'Odisha';
      existing.location = {
        type: 'Point',
        coordinates: [85.8900, 20.4700],
        address: 'Mundali NDRF Base, Cuttack',
      };
      await existing.save();
      rescueUser = existing;
      logger.info(`Updated demo rescue account: ${rescueEmail}`);
    } else {
      rescueUser = await User.create({
        fullName: 'Cmdr. Vikram Rathore',
        email: rescueEmail,
        password: 'Rescue@123',
        role: 'rescue',
        phone: '+91 98110 54321',
        unitId: 'NDRF-BN-03',
        battalion: '03rd NDRF Battalion, Mundali',
        district: 'Cuttack',
        state: 'Odisha',
        location: {
          type: 'Point',
          coordinates: [85.8900, 20.4700],
          address: 'Mundali NDRF Base, Cuttack',
        },
        isVerified: true,
        isActive: true,
      });
      logger.info(`Created demo rescue account: ${rescueEmail} (Password: Rescue@123)`);
    }

    // Ensure Rescue Team record exists
    const teamName = '03rd NDRF Battalion Quick Response Unit';
    const existingTeam = await RescueTeam.findOne({ teamName });
    if (!existingTeam) {
      await RescueTeam.create({
        teamName,
        battalion: '03rd NDRF Battalion, Mundali',
        teamId: 'TEAM-NDRF-03',
        leaderName: 'Cmdr. Vikram Rathore',
        contactPhone: '+91 98110 54321',
        memberCount: 14,
        boatsCount: 4,
        status: 'AVAILABLE',
        currentLocation: {
          type: 'Point',
          coordinates: [85.8900, 20.4700],
          address: 'Mundali NDRF Base, Cuttack',
        },
        equipment: ['Inflatable Motorized Boats', 'Diving Suits', 'Life Jackets', 'Satellite Phones', 'First Aid Kits'],
        specialization: ['Swift Water Rescue', 'Flood Evacuation', 'Medical Triage'],
      });
      logger.info(`Created default NDRF rescue team: ${teamName}`);
    }

    if (require.main === module) {
      await mongoose.connection.close();
      logger.info('Rescue seed completed.');
    }
  } catch (error) {
    logger.error(`Rescue seed error: ${error.message}`);
    if (require.main === module) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedRescue();
}

module.exports = seedRescue;
