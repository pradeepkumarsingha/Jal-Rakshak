const mongoose = require('mongoose');
const { SHELTER_STATUS, SEVERITY_LEVELS } = require('../utils/constants');

const ShelterSchema = new mongoose.Schema(
  {
    shelterId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide shelter name'],
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please provide shelter coordinates'],
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide shelter address'],
      trim: true,
    },
    locationName: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      default: 'Cuttack',
      trim: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Odisha',
      trim: true,
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Please provide total capacity'],
      min: [1, 'Capacity must be at least 1 person'],
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy cannot be negative'],
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    contact: {
      person: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: Object.values(SHELTER_STATUS),
      default: SHELTER_STATUS.ACTIVE,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.LOW,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    elevationMeters: {
      type: Number,
      default: 30,
    },
    roadCondition: {
      type: String,
      default: 'Safe & Clear',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available capacity
ShelterSchema.virtual('availableCapacity').get(function () {
  return Math.max(0, this.totalCapacity - (this.currentOccupancy || 0));
});

// Virtual for occupancy percentage
ShelterSchema.virtual('occupancyRate').get(function () {
  if (!this.totalCapacity) return 0;
  return Math.min(100, Math.round(((this.currentOccupancy || 0) / this.totalCapacity) * 100));
});

// Geospatial index
ShelterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shelter', ShelterSchema);
