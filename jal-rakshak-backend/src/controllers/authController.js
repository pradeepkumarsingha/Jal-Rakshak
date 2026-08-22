const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/helpers');
const { verifyRefreshToken, generateToken, generateRefreshToken } = require('../utils/jwt');
const { sendNewPasswordEmail, sendResetPasswordEmail } = require('../services/emailService');
const logger = require('../utils/logger');


/**
 * Validate that the user role is authorized for the selected portal
 */
const validatePortalRole = (userRole, portal) => {
  if (!portal) return { valid: true };
  const normalizedPortal = portal.toLowerCase().trim();
  const normalizedRole = (userRole || 'citizen').toLowerCase().trim();

  if (normalizedPortal === 'admin' && normalizedRole !== 'admin') {
    return {
      valid: false,
      code: 'PORTAL_ROLE_MISMATCH',
      message: 'This account is not authorized for the Admin Command portal',
    };
  }
  if (normalizedPortal === 'rescue' && normalizedRole !== 'rescue') {
    return {
      valid: false,
      code: 'PORTAL_ROLE_MISMATCH',
      message: 'This account is not authorized for the Rescue Field Unit portal',
    };
  }
  if (normalizedPortal === 'citizen' && normalizedRole !== 'citizen') {
    return {
      valid: false,
      code: 'PORTAL_ROLE_MISMATCH',
      message: 'This account is not authorized for the selected portal',
    };
  }
  return { valid: true };
};

/**
 * @desc    Register a new citizen
 * @route   POST /api/v1/auth/register
 * @access  Public (Citizen only)
 */
const register = async (req, res, next) => {
  try {
    const { fullName, name, email, password, phone, district, state, location, coordinates } = req.body;

    const resolvedName = fullName || name;
    if (!resolvedName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide fullName, email, and password',
        },
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    // Prepare GeoJSON location if provided
    let userLocation = {
      type: 'Point',
      coordinates: [85.8830, 20.4625], // Default Cuttack [lng, lat]
    };

    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      userLocation.coordinates = [Number(location.longitude), Number(location.latitude)];
    } else if (location && location.lat !== undefined && location.lng !== undefined) {
      userLocation.coordinates = [Number(location.lng), Number(location.lat)];
    } else if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      userLocation.coordinates = [Number(coordinates[0]), Number(coordinates[1])];
    }

    // Strictly enforce role: "citizen" on public registration
    const user = await User.create({
      fullName: resolvedName,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'citizen',
      district: district || 'Cuttack',
      state: state || 'Odisha',
      location: userLocation,
      isVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    });

    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getSignedRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Store refresh token
    try {
      await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } catch (e) {
      // non-blocking
    }

    return res.status(201).json({
      success: true,
      message: 'Citizen registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          name: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          district: user.district,
          state: user.state,
          location: user.location,
        },
        accessToken,
        refreshToken,
        token: accessToken, // backward compatibility
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user with portal-role verification
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, portal, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide email and password',
        },
      });
    }

    const requestedPortal = portal || role;

    // Look up user in DB
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Verify password
    const isMatch = typeof user.matchPassword === 'function' ? await user.matchPassword(password) : false;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Validate role against requested portal
    if (requestedPortal) {
      const portalCheck = validatePortalRole(user.role, requestedPortal);
      if (!portalCheck.valid) {
        return res.status(403).json({
          success: false,
          error: {
            code: portalCheck.code,
            message: portalCheck.message,
          },
        });
      }
    }

    // Generate tokens
    const accessToken = typeof user.getSignedJwtToken === 'function'
      ? user.getSignedJwtToken()
      : generateToken({ id: user.id || user._id, role: user.role, email: user.email });

    const refreshToken = typeof user.getSignedRefreshToken === 'function'
      ? user.getSignedRefreshToken()
      : generateRefreshToken({ id: user.id || user._id });

    if (typeof user.save === 'function') {
      user.refreshToken = refreshToken;
      user.lastLoginAt = new Date();
      try {
        await user.save({ validateBeforeSave: false });
      } catch (e) {
        // non-blocking
      }
    }

    try {
      await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } catch (e) {
      // non-blocking
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id || user.id,
          fullName: user.fullName,
          name: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          district: user.district,
          state: user.state,
          designation: user.designation,
          unitId: user.unitId,
          location: user.location,
        },
        accessToken,
        refreshToken,
        token: accessToken, // backward compatibility
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh Access Token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'Refresh token is required',
        },
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED_OR_INVALID',
          message: 'Invalid or expired refresh token',
        },
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User no longer exists',
        },
      });
    }

    const newAccessToken = user.getSignedJwtToken();
    const newRefreshToken = user.getSignedRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        token: newAccessToken, // backward compatibility
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Logged in User Profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const rawId = req.user.id || req.user._id;
    const isValidId = typeof rawId === 'string' && rawId.match(/^[0-9a-fA-F]{24}$/);

    if (!isValidId) {
      return successResponse(res, req.user, 'User profile retrieved successfully');
    }

    const user = await User.findById(rawId);
    if (!user) {
      return successResponse(res, req.user, 'Profile retrieved');
    }

    return successResponse(
      res,
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        district: user.district,
        state: user.state,
        designation: user.designation,
        unitId: user.unitId,
        location: user.location,
        isVerified: user.isVerified,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      'User profile retrieved successfully'
    );
  } catch (error) {
    return successResponse(res, req.user, 'User profile retrieved');
  }
};

/**
 * @desc    Update Profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, district, state, location, designation, coordinates } = req.body;

    const fieldsToUpdate = {};
    if (fullName) fieldsToUpdate.fullName = fullName;
    if (phone) fieldsToUpdate.phone = phone;
    if (district) fieldsToUpdate.district = district;
    if (state) fieldsToUpdate.state = state;
    if (designation) fieldsToUpdate.designation = designation;

    if (location && location.latitude !== undefined && location.longitude !== undefined) {
      fieldsToUpdate.location = {
        type: 'Point',
        coordinates: [Number(location.longitude), Number(location.latitude)],
        address: location.address || district || 'Odisha',
      };
    } else if (location && location.lat !== undefined && location.lng !== undefined) {
      fieldsToUpdate.location = {
        type: 'Point',
        coordinates: [Number(location.lng), Number(location.lat)],
        address: location.address || district || 'Odisha',
      };
    } else if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      fieldsToUpdate.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id || req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / Clear session
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    if (req.user && (req.user.id || req.user._id)) {
      const uid = req.user.id || req.user._id;
      await User.findByIdAndUpdate(uid, { $unset: { refreshToken: 1 } });
      await RefreshToken.updateMany({ user: uid }, { isRevoked: true, revokedAt: new Date() });
    }
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to generate a secure, readable new password
 */
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let password = 'Jal@';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  return password;
};

/**
 * @desc    Forgot Password - Sends a secure password reset link to user's registered email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email, portal } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide your registered email address',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Look up user in DB (case-insensitive regex for robustness)
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email address.',
        },
      });
    }

    // Role verification if portal is specified
    if (portal && user.role !== portal && portal === 'citizen' && user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PORTAL_ROLE_MISMATCH',
          message: 'This account belongs to another portal. Please use the appropriate portal.',
        },
      });
    }

    // Generate password reset token
    const resetToken = typeof user.getResetPasswordToken === 'function'
      ? user.getResetPasswordToken()
      : crypto.randomBytes(32).toString('hex');

    if (typeof user.save === 'function') {
      await user.save({ validateBeforeSave: false });
    }

    // Construct secure reset link
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email || normalizedEmail)}`;

    // Dispatch professional HTML email
    await sendResetPasswordEmail({
      to: user.email || normalizedEmail,
      name: user.fullName || 'Citizen',
      resetUrl,
    });

    logger.info(`Password reset link dispatched via email to ${user.email || normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: 'A secure password reset link has been dispatched to your email address.',
      data: {
        email: user.email || normalizedEmail,
      },
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Reset Password with Secure Token
 * @route   POST /api/v1/auth/reset-password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const rawToken = req.params.token || req.body.token;
    const { password } = req.body;

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: 'Reset token is required.',
        },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password must be at least 6 characters long.',
        },
      });
    }

    // Hash the raw token to match database record
    const hashedToken = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

    // Look up user with matching unexpired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'This password reset link is invalid or has expired. Please request a new one.',
        },
      });
    }

    // Update password (UserSchema pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password successfully reset for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
};
