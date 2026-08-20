const Alert = require('../models/Alert');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @desc    Get Active Alerts
 * @route   GET /api/v1/alerts
 * @access  Private / Public
 */
const getActiveAlerts = async (req, res, next) => {
  try {
    const { language = 'en', latitude, longitude } = req.query;

    const alerts = await Alert.find({ isActive: true }).sort({ createdAt: -1 });

    const formatted = alerts.map((a) => {
      const obj = a.toObject();
      if (language === 'hi' && a.messageHi) {
        obj.displayMessage = a.messageHi;
      } else if (language === 'or' && a.messageOr) {
        obj.displayMessage = a.messageOr;
      } else {
        obj.displayMessage = a.message;
      }
      return obj;
    });

    return successResponse(res, formatted, 'Active alerts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Alert by ID
 * @route   GET /api/v1/alerts/:id
 * @access  Private / Public
 */
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return next(new ErrorResponse(`Alert not found with id ${req.params.id}`, 404));
    }
    return successResponse(res, alert, 'Alert retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Broadcast Alert
 * @route   POST /api/v1/alerts/broadcast
 * @access  Private (Admin only)
 */
const broadcastAlert = async (req, res, next) => {
  try {
    const {
      alertType,
      title,
      message,
      messageHi,
      messageOr,
      targetAreas,
      deliveryChannels,
      expiresAt,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide title and message for the alert broadcast',
        },
      });
    }

    const alert = await Alert.create({
      alertType: alertType || 'CRITICAL',
      title,
      message,
      messageHi: messageHi || 'महानदी नदी का जलस्तर खतरे के निशान से ऊपर है।',
      messageOr: messageOr || 'ମହାନଦୀ ନଦୀର ଜଳସ୍ତର ବିପଦ ସୀମା ଅତିକ୍ରମ କରିଛି।',
      targetAreas: targetAreas || ['Cuttack', 'Naraj'],
      deliveryChannels: deliveryChannels || ['in_app', 'sms', 'push'],
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdBy: req.user ? req.user.id || req.user._id : null,
      createdByName: req.user ? req.user.fullName : 'State Disaster Management Authority',
      isActive: true,
    });

    return successResponse(res, alert, 'Emergency alert broadcasted successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveAlerts,
  getAlertById,
  broadcastAlert,
};
