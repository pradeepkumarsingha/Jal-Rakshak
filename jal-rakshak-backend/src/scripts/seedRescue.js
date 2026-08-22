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
    let rescueUser = await User.findOne({ email: rescueEmail });

    if (rescueUser) {
      rescueUser.password = 'Rescue@123';
      rescueUser.role = 'rescue';
      rescueUser.fullName = 'Cmdr. Vikram Rathore';
      rescueUser.phone = '+91 98110 54321';
      rescueUser.unitId = 'NDRF-BN-03';
      rescueUser.battalion = '03rd NDRF Battalion, Mundali';
      rescueUser.state = 'Odisha';
      rescueUser.location = {
        type: 'Point',
        coordinates: [85.8900, 20.4700],
        address: 'Mundali NDRF Base, Cuttack',
      };
      await rescueUser.save();
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

    const defaultTeams = [
      {
        teamName: '03rd NDRF Battalion Unit (Mundali)',
        teamCode: 'NDRF-03',
        district: 'Cuttack',
        state: 'Odisha',
        teamLead: rescueUser._id,
        members: [rescueUser._id],
        currentLocation: {
          type: 'Point',
          coordinates: [85.8900, 20.4700],
        },
        vehicles: [
          { vehicleId: 'NDRF-BOAT-01', vehicleType: 'Inflatable Motor Boat (IRB)', status: 'AVAILABLE', capacity: 12, fuelPercent: 100 },
          { vehicleId: 'NDRF-BOAT-02', vehicleType: 'Rigid Inflatable Boat (RIB)', status: 'AVAILABLE', capacity: 15, fuelPercent: 95 },
        ],
        resources: { lifeJackets: 40, firstAidKits: 10, rescueBoats: 4, ropes: 20 },
        status: 'AVAILABLE',
        isActive: true,
      },
      {
        teamName: 'ODRAF Quick Response Unit 01 (Bhubaneswar)',
        teamCode: 'ODRAF-01',
        district: 'Khordha',
        state: 'Odisha',
        teamLead: rescueUser._id,
        members: [rescueUser._id],
        currentLocation: {
          type: 'Point',
          coordinates: [85.8245, 20.2961],
        },
        vehicles: [
          { vehicleId: 'ODRAF-BOAT-01', vehicleType: 'Fiberglass Rescue Boat', status: 'AVAILABLE', capacity: 10, fuelPercent: 100 },
        ],
        resources: { lifeJackets: 30, firstAidKits: 8, rescueBoats: 3, ropes: 15 },
        status: 'AVAILABLE',
        isActive: true,
      },
      {
        teamName: 'Odisha Fire & Emergency Water Rescue Wing',
        teamCode: 'OFES-04',
        district: 'Cuttack',
        state: 'Odisha',
        teamLead: rescueUser._id,
        members: [rescueUser._id],
        currentLocation: {
          type: 'Point',
          coordinates: [85.8621, 20.4625],
        },
        vehicles: [
          { vehicleId: 'FIRE-BOAT-03', vehicleType: 'Swift Water Inflatable Raft', status: 'AVAILABLE', capacity: 8, fuelPercent: 90 },
        ],
        resources: { lifeJackets: 25, firstAidKits: 5, rescueBoats: 2, ropes: 12 },
        status: 'AVAILABLE',
        isActive: true,
      },
    ];

    for (const t of defaultTeams) {
      const existingTeam = await RescueTeam.findOne({ teamCode: t.teamCode });
      if (existingTeam) {
        existingTeam.teamName = t.teamName;
        existingTeam.teamLead = t.teamLead;
        existingTeam.members = t.members;
        existingTeam.status = 'AVAILABLE';
        existingTeam.isActive = true;
        await existingTeam.save();
        logger.info(`Updated rescue team: ${t.teamCode}`);
      } else {
        await RescueTeam.create(t);
        logger.info(`Created rescue team: ${t.teamCode} (${t.teamName})`);
      }
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
