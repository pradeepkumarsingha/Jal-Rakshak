const mongoose = require('mongoose');
const { RESCUE_STATUS } = require('../utils/constants');

const RescueTeamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide rescue team name'],
      trim: true,
      index: true,
    },
    commander: {
      type: String,
      required: [true, 'Please provide team commander name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide emergency contact number'],
      trim: true,
    },
    unitType: {
      type: String,
      default: 'Inflatable Motor Boat (IRB) & Dive Team',
      trim: true,
    },
    capacityPersons: {
      type: Number,
      default: 15,
      min: 1,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [85.8621, 20.4782],
      },
    },
    locationName: {
      type: String,
      default: 'Bidanasi Basecamp',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(RESCUE_STATUS),
      default: RESCUE_STATUS.STANDBY_READY,
      index: true,
    },
    activeMissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      default: null,
    },
    activeMissionCode: {
      type: String,
      trim: true,
      default: null,
    },
    equipment: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

RescueTeamSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('RescueTeam', RescueTeamSchema);
