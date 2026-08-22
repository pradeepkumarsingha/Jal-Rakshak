const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    secureUrl: String,
    publicId: String,
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'UNAVAILABLE', 'FAILED'],
      default: 'PENDING',
    },
    floodDetected: {
      type: Boolean,
      default: null,
    },
    confidence: {
      type: Number,
      default: null,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'SEVERE', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    estimatedWaterDepthMeters: {
      type: Number,
      default: null,
    },
    waterCoveragePercent: {
      type: Number,
      default: null,
    },
    roadCondition: {
      type: String,
      enum: ['OPEN', 'PARTIALLY_BLOCKED', 'BLOCKED', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    vehicleTravelRecommendation: {
      type: String,
      enum: ['RECOMMENDED', 'CAUTION', 'NOT_RECOMMENDED', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    hazardObjects: {
      type: [String],
      default: [],
    },
    message: {
      type: String,
      default: null,
    },
    modelName: {
      type: String,
      default: 'ai-report-hazard',
    },
    modelVersion: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: 'deployed_hazard_verification_model',
    },
    isEstimate: {
      type: Boolean,
      default: true,
    },
    requiresHumanVerification: {
      type: Boolean,
      default: true,
    },
    analyzedAt: Date,
    rawResponse: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const citizenReportSchema = new mongoose.Schema(
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

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required in [longitude, latitude] format'],
      },
    },

    address: {
      type: String,
      trim: true,
    },

    waterLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'SEVERE'],
      required: true,
      uppercase: true,
    },

    roadStatus: {
      type: String,
      enum: ['OPEN', 'PARTIALLY_BLOCKED', 'BLOCKED', 'UNKNOWN'],
      required: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: imageSchema,

    aiAnalysis: {
      type: aiAnalysisSchema,
      default: () => ({ status: 'PENDING' }),
    },

    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'ESCALATED'],
      default: 'PENDING',
      index: true,
    },

    verification: {
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      action: String,
      notes: String,
    },

    escalationReason: String,
  },
  {
    timestamps: true,
  }
);

citizenReportSchema.pre('save', function (next) {
  if (!this.reportId) {
    this.reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

// Required indexes
citizenReportSchema.index({ location: '2dsphere' });
citizenReportSchema.index({ verificationStatus: 1, createdAt: -1 });
citizenReportSchema.index({ 'aiAnalysis.severity': 1, createdAt: -1 });

module.exports = mongoose.model('CitizenReport', citizenReportSchema);
