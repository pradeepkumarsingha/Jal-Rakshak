const mongoose = require('mongoose');

const RiskZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      default: 'Odisha',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    location: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default: 'Point',
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed, // [lng, lat] for Point or [[[lng, lat], ...]] for Polygon
        required: true,
      },
    },
    affectedPopulation: {
      type: Number,
      default: 0,
    },
    waterLevelMeters: {
      type: Number,
      default: 0,
    },
    dangerMarkMeters: {
      type: Number,
      default: 26.41,
    },
    currentStatus: {
      type: String,
      default: 'MONITORED',
    },
  },
  {
    timestamps: true,
  }
);

RiskZoneSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RiskZone', RiskZoneSchema);
