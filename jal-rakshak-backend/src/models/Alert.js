const mongoose = require('mongoose');
const { ALERT_TYPES } = require('../utils/constants');

const AlertSchema = new mongoose.Schema(
  {
    alertType: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      default: ALERT_TYPES.WARNING,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide alert title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide alert message in English'],
      trim: true,
    },
    messageHi: {
      type: String, // Hindi
      trim: true,
    },
    messageOr: {
      type: String, // Odia
      trim: true,
    },
    targetAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    deliveryChannels: [
      {
        type: String,
        enum: ['push', 'sms', 'email', 'siren', 'all'],
        default: 'push',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

AlertSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
