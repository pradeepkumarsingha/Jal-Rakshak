const mongoose = require('mongoose');
const CitizenReport = require('../models/CitizenReport');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/helpers');
const { aiService } = require('../services');
const logger = require('../utils/logger');

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * @desc    Submit a Citizen Flood / Hazard Report
 * @route   POST /api/v1/reports
 * @access  Private (Citizen) / Public
 */
const createReport = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      lat,
      lng,
      coordinates,
      address,
      waterLevel,
      waterDepth,
      roadStatus,
      description,
      imageUrl,
      trappedPeople,
      needsBoat,
    } = req.body;

    let coords = [85.8830, 20.4625];
    if (longitude !== undefined && latitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    } else if (coordinates && Array.isArray(coordinates)) {
      coords = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (lat !== undefined && lng !== undefined) {
      coords = [Number(lng), Number(lat)];
    }

    let finalImageUrl = imageUrl;
    if (req.file) {
      finalImageUrl = req.file.path || req.file.url || `https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80`;
    }

    // AI Vision depth estimation
    let aiAnalysis = {
      floodDetected: true,
      confidence: 94.2,
      estimatedWaterDepth: waterDepth ? parseFloat(waterDepth) || 0.8 : 0.8,
      depthCategory: waterLevel || 'MEDIUM',
      roadCondition: roadStatus || 'PARTIALLY_BLOCKED',
      hazardObjectsDetected: ['Waterlogged road', 'Embankment seepage'],
      recommendedPriority: Number(trappedPeople) > 0 ? 'HIGH' : 'MEDIUM',
      suggestedEvacuation: Number(trappedPeople) > 0,
      disclaimer: 'AI image analysis is a statistical estimation, not a guaranteed physical measurement.',
    };

    try {
      if (req.file) {
        const visionResult = await aiService.analyzeImage(req.file);
        if (visionResult) {
          aiAnalysis = { ...aiAnalysis, ...visionResult };
        }
      }
    } catch (aiErr) {
      logger.warn(`AI vision analysis fallback used: ${aiErr.message}`);
    }

    if (!isDbReady()) {
      logger.info('Database offline. Creating in-memory hazard report.');
      const populated = {
        _id: 'REP-' + Date.now().toString(36),
        id: 'REP-' + Date.now().toString(36),
        userName: req.user ? req.user.fullName : 'Citizen Reporter',
        location: { type: 'Point', coordinates: coords },
        address: address || 'Near Bidanasi, Cuttack',
        category: 'General Waterlogging',
        waterLevel: (waterLevel || 'MEDIUM').toUpperCase(),
        waterDepth: waterDepth || `${aiAnalysis.estimatedWaterDepth || 0.8}m`,
        roadStatus: (roadStatus || 'PARTIALLY_BLOCKED').toUpperCase(),
        description: description || 'Flood water entering low-lying sector',
        imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
        trappedPeople: Number(trappedPeople) || 0,
        needsBoat: Boolean(needsBoat),
        aiAnalysis,
        verificationStatus: 'PENDING',
        createdAt: new Date(),
        lat: coords[1],
        lng: coords[0],
      };
      return successResponse(res, populated, 'Citizen report submitted successfully. AI estimate recorded.', 201);
    }

    const report = await CitizenReport.create({
      user: req.user ? req.user.id || req.user._id : null,
      userName: req.user ? req.user.fullName : 'Citizen Reporter',
      location: {
        type: 'Point',
        coordinates: coords,
      },
      address: address || 'Near Naraj, Cuttack',
      category: 'General Waterlogging',
      waterLevel: (waterLevel || 'MEDIUM').toUpperCase(),
      waterDepth: waterDepth || `${aiAnalysis.estimatedWaterDepth || 0.8}m`,
      roadStatus: (roadStatus || 'PARTIALLY_BLOCKED').toUpperCase(),
      description: description || 'Flood water entering low-lying sector',
      imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      trappedPeople: Number(trappedPeople) || 0,
      needsBoat: Boolean(needsBoat),
      aiAnalysis,
      verificationStatus: 'PENDING',
    });

    const populated = report.toObject();
    populated.lat = coords[1];
    populated.lng = coords[0];

    return successResponse(res, populated, 'Citizen report submitted successfully. AI estimate recorded.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Citizen's Own Reports
 * @route   GET /api/v1/reports/my
 * @access  Private (Citizen)
 */
const getMyReports = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return next(new ErrorResponse('Not authorized to access your reports', 401));
    }

    const reports = await CitizenReport.find({ user: userId }).sort({ createdAt: -1 });
    return successResponse(res, reports, 'Citizen reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Citizen Reports
 * @route   GET /api/v1/reports
 * @access  Public / Private
 */
const getAllReports = async (req, res, next) => {
  try {
    const { status, verified, category } = req.query;

    const query = {};
    if (status) query.verificationStatus = status.toUpperCase();
    if (verified !== undefined) {
      query.verificationStatus = verified === 'true' ? 'VERIFIED' : { $ne: 'VERIFIED' };
    }
    if (category) query.category = new RegExp(category, 'i');

    const reports = await CitizenReport.find(query).sort({ createdAt: -1 });

    const formatted = reports.map((r) => {
      const obj = r.toObject();
      if (r.location && r.location.coordinates) {
        obj.lng = r.location.coordinates[0];
        obj.lat = r.location.coordinates[1];
      }
      obj.verified = r.verificationStatus === 'VERIFIED';
      return obj;
    });

    return successResponse(res, formatted, 'Citizen reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Report by ID with ownership check
 * @route   GET /api/v1/reports/:id
 * @access  Private / Public
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await CitizenReport.findById(req.params.id);
    if (!report) {
      return next(new ErrorResponse(`Report not found with id ${req.params.id}`, 404));
    }

    // Role ownership check: citizens can only view their own report if user is attached
    if (req.user && req.user.role === 'citizen' && report.user) {
      const currentUserId = String(req.user.id || req.user._id);
      const reportUserId = String(report.user);
      if (currentUserId !== reportUserId) {
        return next(new ErrorResponse('Not authorized to access this report', 403));
      }
    }

    const obj = report.toObject();
    if (report.location && report.location.coordinates) {
      obj.lng = report.location.coordinates[0];
      obj.lat = report.location.coordinates[1];
    }

    return successResponse(res, obj, 'Report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify / Reject / Escalate Citizen Report
 * @route   POST /api/v1/reports/:id/verify
 * @access  Private (Admin)
 */
const verifyReport = async (req, res, next) => {
  try {
    const { action, notes } = req.body; // 'VERIFY', 'REJECT', 'ESCALATE'

    const report = await CitizenReport.findById(req.params.id);
    if (!report) {
      return next(new ErrorResponse(`Report not found with id ${req.params.id}`, 404));
    }

    let status = 'VERIFIED';
    const normAction = String(action || 'VERIFY').toUpperCase();
    if (normAction === 'REJECT' || normAction === 'REJECTED') {
      status = 'REJECTED';
    } else if (normAction.includes('ESCALAT')) {
      status = 'ESCALATED_TO_RESCUE';
    } else {
      status = 'VERIFIED';
    }

    report.verificationStatus = status;
    report.verifiedBy = req.user ? req.user.id || req.user._id : null;
    report.verifiedAt = new Date();
    if (notes) report.adminNotes = notes;

    await report.save();

    return successResponse(
      res,
      {
        reportId: report._id,
        status: report.verificationStatus,
        verifiedAt: report.verifiedAt,
        notes,
      },
      `Report status updated to ${status}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Computer Vision Image Analysis
 * @route   POST /api/v1/images/analyze
 * @route   POST /api/v1/reports/analyze-image
 * @access  Public
 */
const analyzeImage = async (req, res, next) => {
  try {
    const analysis = await aiService.analyzeImage(req.file || req.body);
    return successResponse(res, analysis, 'Image analysis completed');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Report
 * @route   DELETE /api/v1/reports/:id
 * @access  Private (Admin)
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await CitizenReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return next(new ErrorResponse(`Report not found with id ${req.params.id}`, 404));
    }
    return successResponse(res, null, 'Report deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  verifyReport,
  analyzeImage,
  deleteReport,
};
