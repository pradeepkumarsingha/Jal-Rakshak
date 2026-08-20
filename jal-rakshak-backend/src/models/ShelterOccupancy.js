const mongoose = require('mongoose');

const ShelterOccupancySchema = new mongoose.Schema(
  {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      required: true,
      index: true,
    },
    currentOccupancy: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
    },
    occupancyRate: {
      type: Number, // Percentage 0 - 100
      default: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ShelterOccupancy', ShelterOccupancySchema);
