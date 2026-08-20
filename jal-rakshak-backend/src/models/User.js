const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { ROLES } = require('../utils/constants');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: [ROLES.CITIZEN, ROLES.ADMIN, ROLES.RESCUE],
      default: ROLES.CITIZEN,
      index: true,
    },
    district: {
      type: String,
      default: 'Cuttack',
      trim: true,
    },
    state: {
      type: String,
      default: 'Odisha',
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    unitId: {
      type: String,
      trim: true,
    },
    battalion: {
      type: String,
      trim: true,
    },
    familyMembers: {
      type: Number,
      default: 1,
      min: 1,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [85.8621, 20.4782], // Default Cuttack coordinates
      },
      address: {
        type: String,
        trim: true,
      },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial index for proximity queries
UserSchema.index({ location: '2dsphere' });

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await hashPassword(this.password);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return comparePassword(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function () {
  return generateToken({
    id: this._id,
    role: this.role,
    email: this.email,
    fullName: this.fullName,
  });
};

// Generate Refresh Token
UserSchema.methods.getSignedRefreshToken = function () {
  return generateRefreshToken({
    id: this._id,
  });
};

module.exports = mongoose.model('User', UserSchema);
