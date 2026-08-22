const mongoose = require('mongoose');
const CitizenReport = require('../models/CitizenReport');
const RescueTeam = require('../models/RescueTeam');
const EmergencyRequest = require('../models/EmergencyRequest');
const RescueAssignment = require('../models/RescueAssignment');
const AuditLog = require('../models/AuditLog');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');
const { cloudinaryService, hazardVerificationService } = require('../services');
const {
  notifyNewReport,
  notifyReportUpdated,
  notifyNewEmergency,
  notifyEmergencyAssigned,
} = require('../socket');
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
 * Helper to find CitizenReport by either MongoDB _id or custom reportId (e.g. REP-6038)
 */
const findReportByIdOrCode = async (idOrCode) => {
  if (!idOrCode) return null;
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrCode);
  if (isObjectId) {
    const doc = await CitizenReport.findById(idOrCode);
    if (doc) return doc;
  }
  return await CitizenReport.findOne({ reportId: idOrCode });
};

/**
 * @desc    Verify / Reject / Escalate Citizen Report
 * @route   POST /api/v1/reports/:id/verify
 * @access  Private (Admin)
 */
const verifyReport = async (req, res, next) => {
  try {
    const { action, notes, rescueTeamId, estimatedEtaMinutes } = req.body;
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

    const report = await findReportByIdOrCode(req.params.id);
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

    // If a rescue team is selected for assignment during verification
    let assignedTeamObj = null;
    let createdEmergency = null;
    let createdAssignment = null;

    if (rescueTeamId && normAction !== 'REJECT') {
      const isTeamObjectId = mongoose.Types.ObjectId.isValid(rescueTeamId);
      assignedTeamObj = isTeamObjectId
        ? await RescueTeam.findById(rescueTeamId)
        : await RescueTeam.findOne({ $or: [{ teamCode: rescueTeamId }, { teamName: rescueTeamId }] });

      if (assignedTeamObj) {
        report.assignedTeam = assignedTeamObj._id;
        report.assignedTeamName = assignedTeamObj.teamName;

        // Automatically create linked emergency dispatch request
        createdEmergency = await EmergencyRequest.create({
          user: report.user || null,
          requestType: 'RESCUE_REQUIRED',
          category: 'Field Hazard Dispatch',
          location: report.location,
          address: report.address || 'Reported Hazard Location',
          totalPeople: 1,
          waterSeverity: report.waterLevel || 'HIGH',
          roadAccess: report.roadStatus || 'BLOCKED',
          description: `Dispatched from verified citizen report (${report.reportId || report._id}): ${report.description || 'Verified field hazard requiring tactical response'}`,
          priorityScore: report.waterLevel === 'SEVERE' ? 95 : report.waterLevel === 'HIGH' ? 85 : 70,
          priorityLevel: report.waterLevel === 'SEVERE' ? 'CRITICAL' : report.waterLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
          status: 'DISPATCHED',
          assignedTeam: assignedTeamObj._id,
        });

        const operatorId = req.user ? (req.user._id || req.user.id) : null;
        const verifyNoteMsg = typeof notes === 'string' && notes.trim()
          ? notes.trim()
          : 'Assigned directly upon hazard report verification';

        createdAssignment = await RescueAssignment.create({
          emergencyRequest: createdEmergency._id,
          rescueTeam: assignedTeamObj._id,
          assignedBy: operatorId,
          assignmentStatus: 'ASSIGNED',
          assignedAt: new Date(),
          estimatedEtaMinutes: Number(estimatedEtaMinutes) || 15,
          notes: [{ message: verifyNoteMsg, createdBy: operatorId, createdAt: new Date() }],
        });

        createdEmergency.activeAssignment = createdAssignment._id;
        await createdEmergency.save();

        assignedTeamObj.status = 'DEPLOYED';
        await assignedTeamObj.save();

        // Emit Socket.IO events for live emergency dispatch
        notifyNewEmergency(createdEmergency);
        notifyEmergencyAssigned(createdEmergency, createdAssignment, assignedTeamObj);
      }
    }

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
        assignedTeam: assignedTeamObj ? assignedTeamObj.teamName : null,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit Socket.IO event for report
    notifyReportUpdated(report);

    return res.status(200).json({
      success: true,
      message: `Report status updated to ${newStatus}${assignedTeamObj ? ` and assigned to ${assignedTeamObj.teamName}` : ''}`,
      data: {
        reportId: report._id,
        verificationStatus: report.verificationStatus,
        verification: report.verification,
        assignedTeam: assignedTeamObj
          ? {
              id: assignedTeamObj._id,
              teamName: assignedTeamObj.teamName,
              teamCode: assignedTeamObj.teamCode,
            }
          : null,
        emergencyId: createdEmergency ? createdEmergency._id : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign Rescue Team to Verified Hazard Report
 * @route   POST /api/v1/reports/:id/assign-rescue
 * @access  Private (Admin)
 */
const assignRescueTeamToReport = async (req, res, next) => {
  try {
    const { rescueTeamId, estimatedEtaMinutes, notes } = req.body;

    if (!rescueTeamId) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rescue team ID is required',
          details: null,
        },
      });
    }

    const report = await findReportByIdOrCode(req.params.id);
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

    const isTeamObjectId = mongoose.Types.ObjectId.isValid(rescueTeamId);
    const team = isTeamObjectId
      ? await RescueTeam.findById(rescueTeamId)
      : await RescueTeam.findOne({ $or: [{ teamCode: rescueTeamId }, { teamName: rescueTeamId }] });

    if (!team) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Rescue team not found with id ${rescueTeamId}`,
          details: null,
        },
      });
    }

    // Automatically create or update linked emergency
    let emergency = null;
    if (report.emergencyRequest) {
      emergency = await EmergencyRequest.findById(report.emergencyRequest);
    }

    if (!emergency) {
      emergency = await EmergencyRequest.create({
        user: report.user || null,
        requestType: 'RESCUE_REQUIRED',
        category: 'Field Hazard Dispatch',
        location: report.location,
        address: report.address || 'Reported Hazard Location',
        totalPeople: 1,
        waterSeverity: report.waterLevel || 'HIGH',
        roadAccess: report.roadStatus || 'BLOCKED',
        description: `Dispatched for verified hazard report (${report.reportId || report._id}): ${report.description || 'Action required at hazard site'}`,
        priorityScore: report.waterLevel === 'SEVERE' ? 95 : report.waterLevel === 'HIGH' ? 85 : 70,
        priorityLevel: report.waterLevel === 'SEVERE' ? 'CRITICAL' : report.waterLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
        status: 'DISPATCHED',
        assignedTeam: team._id,
      });
      report.emergencyRequest = emergency._id;
    } else {
      emergency.assignedTeam = team._id;
      emergency.status = 'DISPATCHED';
    }

    const operatorId = req.user ? (req.user._id || req.user.id) : null;
    const directNoteMsg = typeof notes === 'string' && notes.trim()
      ? notes.trim()
      : 'Assigned to hazard report by State Command Center';

    const assignment = await RescueAssignment.create({
      emergencyRequest: emergency._id,
      rescueTeam: team._id,
      assignedBy: operatorId,
      assignmentStatus: 'ASSIGNED',
      assignedAt: new Date(),
      estimatedEtaMinutes: Number(estimatedEtaMinutes) || 15,
      notes: [{ message: directNoteMsg, createdBy: operatorId, createdAt: new Date() }],
    });

    emergency.activeAssignment = assignment._id;
    await emergency.save();

    team.status = 'DEPLOYED';
    await team.save();

    report.assignedTeam = team._id;
    report.assignedTeamName = team.teamName;
    if (report.verificationStatus === 'PENDING') {
      report.verificationStatus = 'VERIFIED';
    }
    await report.save();

    // Create Audit Log
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      actorRole: req.user?.role || 'admin',
      action: 'RESCUE_DISPATCHED_TO_REPORT',
      entityType: 'CitizenReport',
      entityId: report._id,
      details: {
        teamId: team._id,
        teamName: team.teamName,
        emergencyId: emergency._id,
        notes,
      },
    }).catch((err) => logger.warn(`AuditLog warning: ${err.message}`));

    // Emit Socket.IO events
    notifyNewEmergency(emergency);
    notifyEmergencyAssigned(emergency, assignment, team);
    notifyReportUpdated(report);

    return res.status(200).json({
      success: true,
      message: `Rescue team ${team.teamName} successfully assigned to report location`,
      data: {
        reportId: report._id,
        assignedTeam: {
          id: team._id,
          teamName: team.teamName,
          teamCode: team.teamCode,
        },
        emergencyId: emergency._id,
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

    const reports = await CitizenReport.find({ user: userId })
      .populate('assignedTeam', 'teamName teamCode status phone')
      .sort({ createdAt: -1 });
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
      .populate('user', 'fullName phone')
      .populate('assignedTeam', 'teamName teamCode status phone')
      .sort({ createdAt: -1 });

    const formatted = reports.map((r) => {
      const obj = r.toObject();
      obj.id = r._id;
      obj.reportId = r.reportId || r._id;
      obj.submittedWaterLevel = r.waterLevel;
      obj.submittedRoadStatus = r.roadStatus;
      obj.submittedAt = r.createdAt;
      obj.citizenName = r.user?.fullName || 'Citizen Ground Reporter';
      if (r.assignedTeam) {
        obj.assignedTeam = {
          id: r.assignedTeam._id,
          teamName: r.assignedTeam.teamName,
          teamCode: r.assignedTeam.teamCode,
          status: r.assignedTeam.status,
        };
      } else if (r.assignedTeamName) {
        obj.assignedTeam = {
          teamName: r.assignedTeamName,
        };
      }
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
    const report = await findReportByIdOrCode(req.params.id);
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
    const report = await findReportByIdOrCode(req.params.id);
    if (!report) {
      return next(new ErrorResponse(`Report not found with id ${req.params.id}`, 404));
    }

    if (report.image?.publicId) {
      await cloudinaryService.deleteImage(report.image.publicId).catch((err) =>
        logger.warn(`Failed to clean up Cloudinary asset: ${err.message}`)
      );
    }

    await CitizenReport.findByIdAndDelete(report._id);
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
  assignRescueTeamToReport,
  getMyReports,
  getAllReports,
  getReportById,
  deleteReport,
  analyzeImage,
};
