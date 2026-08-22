const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
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

const rescueAssignmentSchema = new mongoose.Schema(
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
      required: false,
    },

    assignmentStatus: {
      type: String,
      enum: [
        'ASSIGNED',
        'DISPATCHED',
        'EN_ROUTE',
        'ON_SCENE',
        'RESCUED',
        'CLOSED',
        'CANCELLED',
      ],
      default: 'ASSIGNED',
      index: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    dispatchedAt: Date,
    enRouteAt: Date,
    onSceneAt: Date,
    rescuedAt: Date,
    closedAt: Date,

    estimatedEtaMinutes: {
      type: Number,
      default: 15,
    },

    routeSnapshot: mongoose.Schema.Types.Mixed,

    notes: [noteSchema],

    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

rescueAssignmentSchema.index({
  rescueTeam: 1,
  assignmentStatus: 1,
  assignedAt: -1,
});

rescueAssignmentSchema.index({
  emergencyRequest: 1,
  assignmentStatus: 1,
});

module.exports = mongoose.model('RescueAssignment', rescueAssignmentSchema);
