const mongoose = require('mongoose');
const { REPORT_STATUS, WATER_SEVERITY, ROAD_ACCESS } = require('../utils/constants');

const CitizenReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please provide report coordinates'],
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide location address / landmark'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General Waterlogging',
    },
    waterLevel: {
      type: String,
      enum: Object.values(WATER_SEVERITY),
      default: WATER_SEVERITY.MEDIUM,
    },
    waterDepth: {
      type: String,
      default: '0.5 meters',
    },
    roadStatus: {
      type: String,
      enum: Object.values(ROAD_ACCESS),
      default: ROAD_ACCESS.PARTIALLY_BLOCKED,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the ground situation'],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    trappedPeople: {
      type: Number,
      default: 0,
    },
    needsBoat: {
      type: Boolean,
      default: false,
    },
    aiAnalysis: {
      floodDetected: { type: Boolean, default: true },
      confidence: { type: Number, default: 92 },
      estimatedWaterDepth: { type: Number, default: 0.8 },
      depthCategory: { type: String, default: 'Knee-to-Waist Level' },
      roadCondition: { type: String, default: 'Submerged' },
      hazardObjectsDetected: [{ type: String }],
      recommendedPriority: { type: String, default: 'MEDIUM' },
      suggestedEvacuation: { type: Boolean, default: false },
    },
    verificationStatus: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING_REVIEW,
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CitizenReportSchema.pre('save', function (next) {
  if (!this.reportId) {
    this.reportId = `REP-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

CitizenReportSchema.index({ location: '2dsphere' });
CitizenReportSchema.index({ verificationStatus: 1, createdAt: -1 });

module.exports = mongoose.model('CitizenReport', CitizenReportSchema);
