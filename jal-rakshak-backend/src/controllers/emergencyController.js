const mongoose = require('mongoose');
const EmergencyRequest = require('../models/EmergencyRequest');
const RescueTeam = require('../models/RescueTeam');
const RescueAssignment = require('../models/RescueAssignment');
const AuditLog = require('../models/AuditLog');
const { calculateEmergencyPriority } = require('../services/priorityService');
const { aiService } = require('../services');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');
const { notifyNewEmergency, notifyEmergencyAssigned } = require('../socket');
const logger = require('../utils/logger');

/**
 * @desc    Create an Emergency SOS Distress Request
 * @route   POST /api/v1/emergency/request
 * @access  Private (Citizen) / Public
 */
const createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      requestType,
      latitude,
      longitude,
      lat,
      lng,
      coordinates,
      address,
      totalPeople,
      childrenCount,
      elderlyCount,
      disabilityCount,
      infantsCount,
      pregnantCount,
      victims,
      medicalEmergency,
      waterSeverity,
      waterDepth,
      roadAccess,
      description,
      imageUrl,
      contact,
      contactName,
      contactPhone,
      altPhone,
    } = req.body;

    let coords = [85.8245, 20.2961];
    if (longitude !== undefined && latitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    } else if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
      coords = [Number(coordinates[0]), Number(coordinates[1])];
    } else if (lat !== undefined && lng !== undefined) {
      coords = [Number(lng), Number(lat)];
    }

    const resolvedPeople = Number(totalPeople || 1);
    const resolvedVictims = victims || {
      infants: Number(infantsCount || 0),
      children: Number(childrenCount || 0),
      elderly: Number(elderlyCount || 0),
      pregnant: Number(pregnantCount || 0),
      adults: Math.max(1, resolvedPeople - Number(childrenCount || 0) - Number(elderlyCount || 0)),
    };

    // Calculate priority using priority service
    let priorityScore = 75;
    let priorityLevel = 'HIGH';

    try {
      const priorityResult = calculateEmergencyPriority({
        totalPeople: resolvedPeople,
        victims: resolvedVictims,
        medicalEmergency: Boolean(medicalEmergency),
        waterSeverity: waterSeverity || 'HIGH',
        waterDepth: waterDepth || '1.2m',
        roadAccess: roadAccess || 'BLOCKED',
      });
      priorityScore = priorityResult.priorityScore || 75;
      priorityLevel = priorityResult.priorityLevel || 'HIGH';
    } catch (err) {
      logger.warn(`Priority calculation fallback used: ${err.message}`);
    }

    const userId = req.user ? req.user._id || req.user.id : null;

    const emergency = await EmergencyRequest.create({
      user: userId,
      requestType: requestType || 'RESCUE_REQUIRED',
      location: {
        type: 'Point',
        coordinates: coords,
      },
      address: address || 'Bhubaneswar, Odisha',
      totalPeople: resolvedPeople,
      childrenCount: Number(childrenCount || resolvedVictims.children || 0),
      elderlyCount: Number(elderlyCount || resolvedVictims.elderly || 0),
      disabilityCount: Number(disabilityCount || 0),
      medicalEmergency: Boolean(medicalEmergency),
      waterSeverity: (waterSeverity || 'HIGH').toUpperCase(),
      roadAccess: (roadAccess || 'BLOCKED').toUpperCase(),
      description: description || 'Urgent flood rescue required',
      image: imageUrl ? { secureUrl: imageUrl } : null,
      priorityScore,
      priorityLevel,
      status: 'PENDING',
      contact: {
        name: (contact && contact.name) || contactName || (req.user ? req.user.fullName : 'Citizen Distress'),
        phone: (contact && contact.phone) || contactPhone || (req.user ? req.user.phone : '+919876543210'),
        altPhone: (contact && contact.altPhone) || altPhone || '',
      },
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: userId,
          changedAt: new Date(),
          note: 'Distress beacon activated',
        },
      ],
    });

    // Create Audit Log
    await AuditLog.create({
      user: userId,
      actorRole: req.user?.role || 'citizen',
      action: 'EMERGENCY_CREATED',
      entityType: 'EmergencyRequest',
      entityId: emergency._id,
      details: {
        requestId: emergency.requestId,
        priorityScore,
        priorityLevel,
        totalPeople: resolvedPeople,
        medicalEmergency: Boolean(medicalEmergency),
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit Socket.IO notification
    notifyNewEmergency(emergency);

    const safeResponse = {
      id: emergency._id,
      emergencyId: emergency._id,
      requestId: emergency.requestId,
      status: emergency.status,
      priorityScore: emergency.priorityScore,
      priorityLevel: emergency.priorityLevel,
      location: {
        latitude: coords[1],
        longitude: coords[0],
        address: emergency.address,
      },
      totalPeople: emergency.totalPeople,
      createdAt: emergency.createdAt,
      safetyGuidance: 'Stay on the highest structure possible. Avoid moving water. A rescue unit has been alerted.',
    };

    return res.status(201).json({
      success: true,
      message: 'Emergency SOS request registered and broadcasted to command center.',
      data: safeResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Citizen's Own Emergency Requests
 * @route   GET /api/v1/emergency/my
 * @access  Private (Citizen)
 */
const getMyEmergencies = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id || req.user.id : null;
    if (!userId) {
      return next(new ErrorResponse('Not authorized to access emergency records', 401));
    }

    const emergencies = await EmergencyRequest.find({ user: userId })
      .populate('assignedTeam', 'teamName teamCode status phone')
      .populate('activeAssignment')
      .sort({ createdAt: -1 });

    const formatted = emergencies.map((e) => ({
      emergencyId: e._id,
      id: e._id,
      requestId: e.requestId,
      status: e.status,
      priorityLevel: e.priorityLevel,
      priorityScore: e.priorityScore,
      location: {
        latitude: e.location?.coordinates ? e.location.coordinates[1] : null,
        longitude: e.location?.coordinates ? e.location.coordinates[0] : null,
        address: e.address,
      },
      totalPeople: e.totalPeople,
      medicalEmergency: e.medicalEmergency,
      assignedTeam: e.assignedTeam
        ? {
            teamName: e.assignedTeam.teamName,
            teamCode: e.assignedTeam.teamCode,
            status: e.assignedTeam.status,
          }
        : null,
      estimatedEtaMinutes: e.activeAssignment?.estimatedEtaMinutes || null,
      createdAt: e.createdAt,
      statusHistory: e.statusHistory,
    }));

    return successResponse(res, formatted, 'Your emergency requests retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Emergency Requests (Admin & Rescue)
 * @route   GET /api/v1/emergency/requests
 * @access  Private (Admin & Rescue)
 */
const getAllRequests = async (req, res, next) => {
  try {
    const { status, priority, priorityLevel } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (priority || priorityLevel) {
      query.priorityLevel = (priority || priorityLevel).toUpperCase();
    }

    const requests = await EmergencyRequest.find(query)
      .populate('assignedTeam', 'teamName teamCode status vehicles resources')
      .populate('activeAssignment')
      .sort({ priorityScore: -1, createdAt: 1 });

    const formatted = requests.map((r) => {
      const obj = r.toObject();
      if (r.location && r.location.coordinates) {
        obj.lng = r.location.coordinates[0];
        obj.lat = r.location.coordinates[1];
      }
      obj.id = r._id;
      return obj;
    });

    return successResponse(res, formatted, 'Emergency requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Emergency Request by ID
 * @route   GET /api/v1/emergency/:id
 * @access  Private
 */
const getRequestById = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query)
      .populate('assignedTeam', 'teamName teamCode status vehicles resources phone')
      .populate('activeAssignment');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Emergency request not found with id ${req.params.id}`,
          details: null,
        },
      });
    }

    const obj = emergency.toObject();
    if (emergency.location && emergency.location.coordinates) {
      obj.lng = emergency.location.coordinates[0];
      obj.lat = emergency.location.coordinates[1];
    }
    obj.id = emergency._id;

    return successResponse(res, obj, 'Emergency request retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Assigns Real Rescue Team to Emergency Request
 * @route   POST /api/v1/emergency/:id/assign
 * @access  Private (Admin)
 */
const assignTeam = async (req, res, next) => {
  try {
    const { rescueTeamId, estimatedEtaMinutes, note } = req.body;

    if (!rescueTeamId) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'rescueTeamId is required to assign an emergency',
          details: null,
        },
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Emergency request not found with id ${req.params.id}`,
          details: null,
        },
      });
    }

    if (['CLOSED', 'RESCUED', 'CANCELLED'].includes(emergency.status)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INVALID_EMERGENCY_STATE',
          message: `Cannot assign emergency with status ${emergency.status}`,
          details: null,
        },
      });
    }

    // Validate rescue team in MongoDB
    const isTeamObjectId = mongoose.Types.ObjectId.isValid(rescueTeamId);
    const team = await RescueTeam.findOne(isTeamObjectId ? { _id: rescueTeamId } : { teamCode: rescueTeamId });

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

    if (!team.isActive) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'TEAM_INACTIVE',
          message: 'Selected rescue team is marked inactive',
          details: null,
        },
      });
    }

    const now = new Date();
    const eta = Number(estimatedEtaMinutes) || 18;
    const adminUser = req.user;

    // Create RescueAssignment document
    const assignment = await RescueAssignment.create({
      emergencyRequest: emergency._id,
      rescueTeam: team._id,
      assignedBy: adminUser ? adminUser._id || adminUser.id : null,
      assignmentStatus: 'ASSIGNED',
      assignedAt: now,
      estimatedEtaMinutes: eta,
      notes: note
        ? [
            {
              message: note,
              createdBy: adminUser ? adminUser._id || adminUser.id : null,
              createdAt: now,
            },
          ]
        : [],
      statusHistory: [
        {
          status: 'ASSIGNED',
          changedBy: adminUser ? adminUser._id || adminUser.id : null,
          changedAt: now,
          note: note || `Assigned to ${team.teamName} by administrator`,
        },
      ],
    });

    // Update EmergencyRequest
    emergency.status = 'ASSIGNED';
    emergency.assignedTeam = team._id;
    emergency.activeAssignment = assignment._id;
    emergency.statusHistory.push({
      status: 'ASSIGNED',
      changedBy: adminUser ? adminUser._id || adminUser.id : null,
      changedAt: now,
      note: note || `Assigned to ${team.teamName}`,
    });
    await emergency.save();

    // Update RescueTeam status
    team.status = 'DEPLOYED';
    await team.save();

    // Create Audit Log
    await AuditLog.create({
      user: adminUser ? adminUser._id || adminUser.id : null,
      actorRole: adminUser?.role || 'admin',
      action: 'EMERGENCY_ASSIGNED',
      entityType: 'EmergencyRequest',
      entityId: emergency._id,
      details: {
        emergencyId: emergency._id,
        assignmentId: assignment._id,
        teamId: team._id,
        teamName: team.teamName,
        teamCode: team.teamCode,
        etaMinutes: eta,
        note,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit Socket.IO events
    notifyEmergencyAssigned(emergency, assignment, team);

    return res.status(200).json({
      success: true,
      message: 'Emergency request assigned to rescue team.',
      data: {
        emergencyId: emergency._id,
        assignmentId: assignment._id,
        status: 'ASSIGNED',
        assignedTeam: {
          id: team._id,
          teamName: team.teamName,
          teamCode: team.teamCode,
          status: team.status,
        },
        estimatedEtaMinutes: eta,
        assignedAt: now.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add Emergency Operational Note
 * @route   POST /api/v1/emergency/:id/notes
 * @access  Private (Admin / Rescue)
 */
const addNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query);
    if (!emergency) {
      return next(new ErrorResponse(`Emergency request not found with id ${req.params.id}`, 404));
    }

    if (emergency.activeAssignment) {
      await RescueAssignment.findByIdAndUpdate(emergency.activeAssignment, {
        $push: {
          notes: {
            message: note,
            createdBy: req.user ? req.user._id || req.user.id : null,
            createdAt: new Date(),
          },
        },
      });
    }

    return successResponse(
      res,
      {
        emergencyId: emergency._id,
        note,
        addedBy: req.user ? req.user.fullName : 'Command Unit',
        timestamp: new Date().toISOString(),
      },
      'Note attached to emergency request'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Emergency Status (Admin / Rescue fallback)
 * @route   PATCH /api/v1/emergency/:id/status
 * @access  Private (Rescue / Admin)
 */
const updateStatus = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Emergency request not found with id ${req.params.id}`, details: null },
      });
    }

    if (emergency.activeAssignment) {
      req.params.assignmentId = String(emergency.activeAssignment);
      const { updateAssignmentStatus } = require('./rescueController');
      return updateAssignmentStatus(req, res, next);
    }

    const { status, note } = req.body;
    if (status) {
      emergency.status = status.toUpperCase();
      emergency.statusHistory.push({
        status: status.toUpperCase(),
        changedBy: req.user ? req.user._id || req.user.id : null,
        changedAt: new Date(),
        note: note || `Status updated to ${status}`,
      });
      await emergency.save();
    }

    return successResponse(res, emergency, `Emergency status updated to ${emergency.status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmergencyRequest,
  getMyEmergencies,
  getAllRequests,
  getRequestById,
  assignTeam,
  updateStatus,
  addNote,
};
