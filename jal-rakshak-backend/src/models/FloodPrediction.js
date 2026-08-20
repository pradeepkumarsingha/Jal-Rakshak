const mongoose = require('mongoose');
const { SEVERITY_LEVELS } = require('../utils/constants');

const FloodPredictionSchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
      },
    },
    locationName: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      default: 'Odisha',
      trim: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      required: true,
      index: true,
    },
    predictedInundationDepth: {
      type: String,
      default: '0.0 meters',
    },
    rainfallForecastMm: {
      type: Number,
      default: 0,
    },
    soilSaturationPct: {
      type: Number,
      default: 0,
    },
    damDischargeRateCusecs: {
      type: String,
      default: 'Normal',
    },
    forecast: {
      h6: { score: Number, level: String, waterLevel: Number, rainMm: Number },
      h12: { score: Number, level: String, waterLevel: Number, rainMm: Number },
      h24: { score: Number, level: String, waterLevel: Number, rainMm: Number },
    },
    forecastTimeline: [
      {
        time: String,
        timeLabel: String,
        rainMm: Number,
        waterLevel: Number,
        riskScore: Number,
        status: String,
      },
    ],
    contributingFactors: [
      {
        name: String,
        value: String,
        impact: {
          type: String,
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        },
      },
    ],
    modelVersion: {
      type: String,
      default: 'JalRakshak-HydroML-v2.4',
    },
    confidence: {
      type: Number,
      default: 94.5,
    },
  },
  {
    timestamps: true,
  }
);

FloodPredictionSchema.index({ location: '2dsphere' });
FloodPredictionSchema.index({ locationName: 1, createdAt: -1 });

module.exports = mongoose.model('FloodPrediction', FloodPredictionSchema);
