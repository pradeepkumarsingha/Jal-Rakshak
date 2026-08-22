const mongoose = require('mongoose');

const emergencyStatusHistorySchema = new mongoose.Schema(
  {
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  },
  { _id: false }
);

const emergencyRequestSchema = new mongoose.Schema(
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
      default: 'RESCUE_REQUIRED',
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Distress coordinates are required'],
      },
    },

    address: {
      type: String,
      trim: true,
    },

    totalPeople: {
      type: Number,
      default: 1,
      min: 1,
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

    medicalEmergency: {
      type: Boolean,
      default: false,
    },

    waterSeverity: {
      type: String,
      default: 'HIGH',
    },

    roadAccess: {
      type: String,
      default: 'BLOCKED',
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      secureUrl: String,
      publicId: String,
    },

    priorityScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
      index: true,
    },

    priorityLevel: {
      type: String,
      default: 'HIGH',
      index: true,
    },

    status: {
      type: String,
      enum: [
        'PENDING',
        'ASSIGNED',
        'DISPATCHED',
        'EN_ROUTE',
        'ON_SCENE',
        'RESCUED',
        'CLOSED',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },

    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeam',
      default: null,
      index: true,
    },

    activeAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueAssignment',
      default: null,
      index: true,
    },

    contact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      altPhone: { type: String, trim: true },
    },

    statusHistory: [emergencyStatusHistorySchema],
  },
  {
    timestamps: true,
  }
);

emergencyRequestSchema.pre('save', function (next) {
  if (!this.requestId) {
    this.requestId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

emergencyRequestSchema.index({ location: '2dsphere' });
emergencyRequestSchema.index({ status: 1, priorityScore: -1, createdAt: 1 });

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
