const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: String,
    vehicleType: String,
    status: {
      type: String,
      enum: ['AVAILABLE', 'DEPLOYED', 'MAINTENANCE', 'OFFLINE'],
      default: 'AVAILABLE',
    },
    capacity: {
      type: Number,
      default: 6,
    },
    fuelPercent: {
      type: Number,
      default: 100,
    },
  },
  { _id: false }
);

const rescueTeamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },

    teamCode: {
      type: String,
      unique: true,
      required: [true, 'Unique team code is required'],
      uppercase: true,
      trim: true,
    },

    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [85.8245, 20.2961],
      },
    },

    district: {
      type: String,
      default: 'Cuttack',
      trim: true,
    },

    state: {
      type: String,
      default: 'Odisha',
      trim: true,
    },

    vehicles: [vehicleSchema],

    resources: {
      lifeJackets: { type: Number, default: 20 },
      firstAidKits: { type: Number, default: 5 },
      rescueBoats: { type: Number, default: 2 },
      ropes: { type: Number, default: 10 },
    },

    status: {
      type: String,
      enum: ['AVAILABLE', 'DEPLOYED', 'OFFLINE', 'MAINTENANCE'],
      default: 'AVAILABLE',
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

rescueTeamSchema.index({ currentLocation: '2dsphere' });
rescueTeamSchema.index({ status: 1, district: 1 });

module.exports = mongoose.model('RescueTeam', rescueTeamSchema);
