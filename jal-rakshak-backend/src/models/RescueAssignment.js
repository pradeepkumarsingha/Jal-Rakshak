const mongoose = require('mongoose');

const RescueAssignmentSchema = new mongoose.Schema(
  {
    emergencyRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      required: true,
      index: true,
    },
    rescueTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RescueTeam',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'RESCUED', 'CLOSED', 'CANCELLED'],
      default: 'ASSIGNED',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    priorityScore: {
      type: Number,
      default: 50,
    },
    etaMinutes: {
      type: Number,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RescueAssignment', RescueAssignmentSchema);
