const mongoose = require('mongoose');
const {
  EMERGENCY_TYPES,
  EMERGENCY_STATUS,
  SEVERITY_LEVELS,
  WATER_SEVERITY,
  ROAD_ACCESS,
} = require('../utils/constants');

const EmergencyRequestSchema = new mongoose.Schema(
  {
    requestId: {
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
    requestType: {
      type: String,
      enum: Object.values(EMERGENCY_TYPES),
      default: EMERGENCY_TYPES.RESCUE_REQUIRED,
    },
    category: {
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
        required: [true, 'Please provide emergency coordinates'],
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide landmark / address'],
      trim: true,
    },
    totalPeople: {
      type: Number,
      required: [true, 'Please provide total number of people'],
      min: [1, 'Must specify at least 1 person'],
    },
    childrenCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    elderlyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    disabilityCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    infantsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pregnantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    victims: {
      infants: { type: Number, default: 0 },
      children: { type: Number, default: 0 },
      adults: { type: Number, default: 1 },
      elderly: { type: Number, default: 0 },
      pregnant: { type: Number, default: 0 },
    },
    medicalEmergency: {
      type: Boolean,
      default: false,
    },
    waterSeverity: {
      type: String,
      enum: Object.values(WATER_SEVERITY),
      default: WATER_SEVERITY.MEDIUM,
    },
    waterDepth: {
      type: String,
      default: '1.0 meters',
    },
    roadAccess: {
      type: String,
      enum: Object.values(ROAD_ACCESS),
      default: ROAD_ACCESS.UNKNOWN,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
      index: true,
    },
    priorityLevel: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.HIGH,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(EMERGENCY_STATUS),
      default: EMERGENCY_STATUS.PENDING,
      index: true,
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeam',
      index: true,
    },
    assignedTeamName: {
      type: String,
      trim: true,
    },
    etaMinutes: {
      type: Number,
      default: null,
    },
    assignedAt: {
      type: Date,
    },
    rescuedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    contact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      altPhone: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate sequential/human-readable requestId if not provided
EmergencyRequestSchema.pre('save', function (next) {
  if (!this.requestId) {
    this.requestId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

EmergencyRequestSchema.index({ location: '2dsphere' });
EmergencyRequestSchema.index({ status: 1, priorityScore: -1 });

module.exports = mongoose.model('EmergencyRequest', EmergencyRequestSchema);
