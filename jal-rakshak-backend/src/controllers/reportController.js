const mongoose = require('mongoose');
const CitizenReport = require('../models/CitizenReport');
const AuditLog = require('../models/AuditLog');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');
const { cloudinaryService, hazardVerificationService } = require('../services');
const { notifyNewReport, notifyReportUpdated } = require('../socket');
const logger = require('../utils/logger');

const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Severity ranking map for sorting pending reports
 */
const SEVERITY_RANK = {
  SEVERE: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  UNKNOWN: 0,
};

/**
 * @desc    Submit a Citizen Flood / Hazard Report
 * @route   POST /api/v1/reports
 * @access  Private (Citizen) / Authenticated
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
      roadStatus,
      description,
    } = req.body;

    // Validate Coordinates
    let coords = [85.8245, 20.2961];
    if (longitude !== undefined && latitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    } else if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      coords = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (lat !== undefined && lng !== undefined) {
      coords = [Number(lng), Number(lat)];
    }

    if (isNaN(coords[0]) || isNaN(coords[1])) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid latitude and longitude coordinates are required',
          details: null,
        },
      });
    }

    // Validate Water Level
    const normalizedWaterLevel = (waterLevel || 'MEDIUM').toUpperCase();
    if (!['LOW', 'MEDIUM', 'HIGH', 'SEVERE'].includes(normalizedWaterLevel)) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Water level must be one of: LOW, MEDIUM, HIGH, SEVERE',
          details: null,
        },
      });
    }

    // Validate Road Status
    const normalizedRoadStatus = (roadStatus || 'PARTIALLY_BLOCKED').toUpperCase();
    if (!['OPEN', 'PARTIALLY_BLOCKED', 'BLOCKED', 'UNKNOWN'].includes(normalizedRoadStatus)) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Road status must be one of: OPEN, PARTIALLY_BLOCKED, BLOCKED, UNKNOWN',
          details: null,
        },
      });
    }

    let storedImageData = null;
    let normalizedAiAnalysis = {
      status: 'UNAVAILABLE',
      floodDetected: null,
      confidence: null,
      severity: 'UNKNOWN',
      estimatedWaterDepthMeters: null,
      waterCoveragePercent: null,
      roadCondition: 'UNKNOWN',
      vehicleTravelRecommendation: 'UNKNOWN',
      hazardObjects: [],
      modelName: 'ai-report-hazard',
      modelVersion: null,
      source: 'no_image_provided',
      isEstimate: true,
      requiresHumanVerification: true,
      analyzedAt: new Date(),
    };

    // If an image was uploaded via Multer
    if (req.file) {
      try {
        logger.info(`Uploading citizen report image to Cloudinary (${req.file.size} bytes)...`);
        const uploadResult = await cloudinaryService.uploadImageBuffer(req.file.buffer, {
          folder: process.env.CLOUDINARY_FOLDER || 'jal-rakshak/reports',
        });

        storedImageData = {
          secureUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          uploadedAt: new Date(),
        };

        // Create audit log for image upload
        await AuditLog.create({
          user: req.user ? req.user._id || req.user.id : null,
          actorRole: req.user?.role || 'citizen',
          action: 'IMAGE_UPLOADED',
          entityType: 'CitizenReportImage',
          details: {
            publicId: uploadResult.publicId,
            bytes: uploadResult.bytes,
            format: uploadResult.format,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));
      } catch (uploadErr) {
        logger.error(`Cloudinary storage error: ${uploadErr.message}`);
        return res.status(502).json({
          success: false,
          error: {
            code: 'UPSTREAM_STORAGE_ERROR',
            message: 'Failed to securely store image to Cloudinary. Please try again.',
            details: null,
          },
        });
      }

      // Call Deployed Hazard Image Verification Service
      try {
        normalizedAiAnalysis = await hazardVerificationService.verifyHazardImage({
          imageUrl: storedImageData.secureUrl,
          buffer: req.file.buffer,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          reportedWaterLevel: normalizedWaterLevel,
        });

        const auditAction =
          normalizedAiAnalysis.status === 'COMPLETED'
            ? 'HAZARD_MODEL_ANALYSIS_COMPLETED'
            : 'HAZARD_MODEL_ANALYSIS_UNAVAILABLE';

        await AuditLog.create({
          user: req.user ? req.user._id || req.user.id : null,
          actorRole: req.user?.role || 'citizen',
          action: auditAction,
          entityType: 'HazardModelAnalysis',
          details: {
            status: normalizedAiAnalysis.status,
            severity: normalizedAiAnalysis.severity,
            confidence: normalizedAiAnalysis.confidence,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));
      } catch (aiErr) {
        logger.warn(`Hazard model analysis exception: ${aiErr.message}`);
        normalizedAiAnalysis = hazardVerificationService.createUnavailableResult(aiErr.message);
      }
    }

    const userId = req.user ? req.user._id || req.user.id : null;

    const report = await CitizenReport.create({
      user: userId,
      location: {
        type: 'Point',
        coordinates: coords,
      },
      address: address || 'Bhubaneswar, Odisha',
      waterLevel: normalizedWaterLevel,
      roadStatus: normalizedRoadStatus,
      description: description || 'Ground situation report',
      image: storedImageData,
      aiAnalysis: normalizedAiAnalysis,
      verificationStatus: 'PENDING',
    });

    // Create Audit Log for report creation
    await AuditLog.create({
      user: userId,
      actorRole: req.user?.role || 'citizen',
      action: 'CITIZEN_REPORT_CREATED',
      entityType: 'CitizenReport',
      entityId: report._id,
      details: {
        reportId: report.reportId,
        waterLevel: report.waterLevel,
        roadStatus: report.roadStatus,
        hasImage: Boolean(storedImageData),
        aiSeverity: normalizedAiAnalysis.severity,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit Socket.IO notification to admin room
    notifyNewReport(report);

    // Citizen Safe Response Payload
    const citizenSafeData = {
      reportId: report._id,
      verificationStatus: report.verificationStatus,
      location: {
        latitude: coords[1],
        longitude: coords[0],
        address: report.address,
      },
      waterLevel: report.waterLevel,
      roadStatus: report.roadStatus,
      image: storedImageData ? { secureUrl: storedImageData.secureUrl } : null,
      aiAnalysis: {
        status: normalizedAiAnalysis.status,
        floodDetected: normalizedAiAnalysis.floodDetected,
        confidence: normalizedAiAnalysis.confidence,
        severity: normalizedAiAnalysis.severity,
        roadCondition: normalizedAiAnalysis.roadCondition,
        message: normalizedAiAnalysis.message,
        isEstimate: true,
        requiresHumanVerification: true,
      },
      createdAt: report.createdAt,
      notice: 'AI analysis is an estimate. An administrator must verify this report.',
    };

    return res.status(201).json({
      success: true,
      message: 'Flood hazard report submitted and is pending verification.',
      data: citizenSafeData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Pending Reports for Admin Verification Queue
 * @route   GET /api/v1/admin/reports/pending
 * @access  Private (Admin)
 */
const getPendingReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const reports = await CitizenReport.find({ verificationStatus: 'PENDING' })
      .populate('user', 'fullName phone email')
      .lean();

    // Sort: 1. AI Severity descending (SEVERE > HIGH > MEDIUM > LOW > UNKNOWN), 2. Created time ascending
    reports.sort((a, b) => {
      const rankA = SEVERITY_RANK[a.aiAnalysis?.severity] ?? 0;
      const rankB = SEVERITY_RANK[b.aiAnalysis?.severity] ?? 0;
      if (rankB !== rankA) {
        return rankB - rankA;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const paginated = reports.slice(skip, skip + limit);

    const formattedData = paginated.map((r) => ({
      reportId: r._id,
      id: r.reportId || r._id,
      citizenName: r.user?.fullName || 'Anonymous Citizen',
      phone: r.user?.phone ? `${r.user.phone.slice(0, 4)}****${r.user.phone.slice(-2)}` : null,
      location: {
        latitude: r.location?.coordinates ? r.location.coordinates[1] : 20.2961,
        longitude: r.location?.coordinates ? r.location.coordinates[0] : 85.8245,
        address: r.address,
      },
      submittedWaterLevel: r.waterLevel,
      submittedRoadStatus: r.roadStatus,
      description: r.description,
      image: r.image?.secureUrl ? { secureUrl: r.image.secureUrl, publicId: r.image.publicId } : null,
      aiAnalysis: r.aiAnalysis,
      verificationStatus: r.verificationStatus,
      submittedAt: r.createdAt,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: 'Pending reports retrieved successfully',
      data: {
        total: reports.length,
        page,
        limit,
        reports: formattedData,
      },
    });
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
    const { action, notes } = req.body;
    const normAction = String(action || 'VERIFY').toUpperCase();

    if (!['VERIFY', 'REJECT', 'ESCALATE'].includes(normAction)) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Action must be one of: VERIFY, REJECT, ESCALATE',
          details: null,
        },
      });
    }

    const report = await CitizenReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Report not found with id ${req.params.id}`,
          details: null,
        },
      });
    }

    let newStatus = 'VERIFIED';
    let auditAction = 'REPORT_VERIFIED';

    if (normAction === 'REJECT') {
      newStatus = 'REJECTED';
      auditAction = 'REPORT_REJECTED';
    } else if (normAction === 'ESCALATE') {
      newStatus = 'ESCALATED';
      auditAction = 'REPORT_ESCALATED';
      report.escalationReason = notes || 'Escalated by administrator for tactical review';
    } else {
      newStatus = 'VERIFIED';
      auditAction = 'REPORT_VERIFIED';
    }

    report.verificationStatus = newStatus;
    report.verification = {
      verifiedBy: req.user ? req.user._id || req.user.id : null,
      verifiedAt: new Date(),
      action: normAction,
      notes: notes || '',
    };

    await report.save();

    // Create Audit Log
    await AuditLog.create({
      user: req.user ? req.user._id || req.user.id : null,
      actorRole: req.user?.role || 'admin',
      action: auditAction,
      entityType: 'CitizenReport',
      entityId: report._id,
      details: {
        action: normAction,
        previousStatus: 'PENDING',
        newStatus,
        notes,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit Socket.IO event
    notifyReportUpdated(report);

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${newStatus}`,
      data: {
        reportId: report._id,
        verificationStatus: report.verificationStatus,
        verification: report.verification,
      },
    });
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
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      return next(new ErrorResponse('Not authorized to access reports', 401));
    }

    const reports = await CitizenReport.find({ user: userId }).sort({ createdAt: -1 });
    return successResponse(res, reports, 'Citizen reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Citizen Reports (Verified or filtered)
 * @route   GET /api/v1/reports
 * @access  Public / Private
 */
const getAllReports = async (req, res, next) => {
  try {
    const { status, verified } = req.query;
    const query = {};

    if (status) {
      query.verificationStatus = status.toUpperCase();
    } else if (verified === 'true') {
      query.verificationStatus = 'VERIFIED';
    }

    const reports = await CitizenReport.find(query)
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });

    const formatted = reports.map((r) => {
      const obj = r.toObject();
      obj.id = r._id;
      obj.reportId = r._id;
      obj.submittedWaterLevel = r.waterLevel;
      obj.submittedRoadStatus = r.roadStatus;
      obj.submittedAt = r.createdAt;
      obj.citizenName = r.user?.fullName || 'Citizen Ground Reporter';
      if (r.location && r.location.coordinates) {
        obj.lng = r.location.coordinates[0];
        obj.lat = r.location.coordinates[1];
      }
      return obj;
    });

    return successResponse(res, formatted, 'Citizen reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Report by ID
 * @route   GET /api/v1/reports/:id
 * @access  Private / Public
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await CitizenReport.findById(req.params.id).populate('user', 'fullName');
    if (!report) {
      return next(new ErrorResponse(`Report not found with id ${req.params.id}`, 404));
    }

    const obj = report.toObject();
    if (report.location && report.location.coordinates) {
      obj.lng = report.location.coordinates[0];
      obj.lat = report.location.coordinates[1];
    }
    obj.id = report._id;

    return successResponse(res, obj, 'Report retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Report (Admin)
 * @route   DELETE /api/v1/reports/:id
 * @access  Private (Admin)
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await CitizenReport.findById(req.params.id);
    if (!report) {
      return next(new ErrorResponse(`Report not found with id ${req.params.id}`, 404));
    }

    if (report.image?.publicId) {
      await cloudinaryService.deleteImage(report.image.publicId).catch((err) =>
        logger.warn(`Failed to clean up Cloudinary asset: ${err.message}`)
      );
    }

    await CitizenReport.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'Report deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Hazard Image Analysis (Direct test endpoint)
 * @route   POST /api/v1/images/analyze
 * @access  Public / Authenticated
 */
const analyzeImage = async (req, res, next) => {
  try {
    const file = req.file;
    const { imageUrl, waterLevel, severity } = req.body || {};

    const analysis = await hazardVerificationService.verifyHazardImage({
      imageUrl,
      buffer: file?.buffer,
      filename: file?.originalname,
      mimetype: file?.mimetype,
      reportedWaterLevel: waterLevel || severity,
    });

    return successResponse(res, analysis, 'Hazard image analysis completed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getPendingReports,
  verifyReport,
  getMyReports,
  getAllReports,
  getReportById,
  deleteReport,
  analyzeImage,
};
