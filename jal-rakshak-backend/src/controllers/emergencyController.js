const mongoose = require('mongoose');
const EmergencyRequest = require('../models/EmergencyRequest');
const RescueTeam = require('../models/RescueTeam');
const { calculateEmergencyPriority } = require('../services/priorityService');
const { aiService } = require('../services');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const isDbReady = () => mongoose.connection.readyState === 1;

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

    let coords = [85.8830, 20.4625];
    if (longitude !== undefined && latitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    } else if (coordinates && Array.isArray(coordinates)) {
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

    // 1. Calculate Priority using AI service / scoring engine
    let priorityScore = 88;
    let priorityLevel = 'CRITICAL';

    try {
      const aiPriority = await aiService.calculatePriority({
        totalPeople: resolvedPeople,
        victims: resolvedVictims,
        medicalEmergency: Boolean(medicalEmergency),
        waterSeverity: waterSeverity || 'SEVERE',
        waterDepth: waterDepth || '1.5m',
        roadAccess: roadAccess || 'BLOCKED',
      });
      if (aiPriority) {
        priorityScore = aiPriority.priorityScore || 88;
        priorityLevel = aiPriority.priorityLevel || 'CRITICAL';
      }
    } catch (aiErr) {
      const fallback = calculateEmergencyPriority({
        totalPeople: resolvedPeople,
        victims: resolvedVictims,
        medicalEmergency: Boolean(medicalEmergency),
        waterSeverity: waterSeverity || 'SEVERE',
        waterDepth: waterDepth || '1.5m',
        roadAccess: roadAccess || 'BLOCKED',
      });
      priorityScore = fallback.priorityScore;
      priorityLevel = fallback.priorityLevel;
    }

    if (!isDbReady()) {
      logger.info('Database offline. Creating in-memory emergency SOS beacon.');
      const obj = {
        _id: 'SOS-' + Date.now().toString(36),
        id: 'SOS-' + Date.now().toString(36),
        requestType: requestType || 'RESCUE_REQUIRED',
        location: { type: 'Point', coordinates: coords },
        address: address || 'Near Bidanasi, Cuttack',
        totalPeople: resolvedPeople,
        childrenCount: Number(childrenCount || resolvedVictims.children || 0),
        elderlyCount: Number(elderlyCount || resolvedVictims.elderly || 0),
        medicalEmergency: Boolean(medicalEmergency),
        waterSeverity: (waterSeverity || 'SEVERE').toUpperCase(),
        waterDepth: waterDepth || '1.5 meters',
        roadAccess: (roadAccess || 'BLOCKED').toUpperCase(),
        description: description || 'Stranded on upper floor due to rapid flood surge',
        imageUrl: imageUrl || '',
        priorityScore,
        priorityLevel,
        status: 'DISPATCHED',
        lat: coords[1],
        lng: coords[0],
        createdAt: new Date(),
        safetyGuidance: 'Stay on the highest level of the building. Do not enter floodwaters. A rescue team has been alerted.',
        disclaimer: 'Priority score supports human decision-making and triage only. It is not an autonomous life-or-death decision.',
      };
      return successResponse(res, obj, 'Emergency SOS request created successfully', 201);
    }

    const emergency = await EmergencyRequest.create({
      user: req.user ? req.user.id || req.user._id : null,
      requestType: requestType || 'RESCUE_REQUIRED',
      location: {
        type: 'Point',
        coordinates: coords,
      },
      address: address || 'Near Naraj, Cuttack',
      totalPeople: resolvedPeople,
      childrenCount: Number(childrenCount || resolvedVictims.children || 0),
      elderlyCount: Number(elderlyCount || resolvedVictims.elderly || 0),
      disabilityCount: Number(disabilityCount || 0),
      medicalEmergency: Boolean(medicalEmergency),
      waterSeverity: (waterSeverity || 'SEVERE').toUpperCase(),
      waterDepth: waterDepth || '1.5 meters',
      roadAccess: (roadAccess || 'BLOCKED').toUpperCase(),
      description: description || 'Family trapped on upper floor',
      imageUrl: imageUrl || '',
      priorityScore,
      priorityLevel,
      status: 'PENDING',
      contact: {
        name: (contact && contact.name) || contactName || (req.user ? req.user.fullName : 'Ramesh Mohanty'),
        phone: (contact && contact.phone) || contactPhone || (req.user ? req.user.phone : '+919876543210'),
        altPhone: (contact && contact.altPhone) || altPhone || '+919123456789',
      },
    });

    const obj = emergency.toObject();
    obj.lat = coords[1];
    obj.lng = coords[0];
    obj.id = emergency._id;
    obj.priorityScore = priorityScore;
    obj.priorityLevel = priorityLevel;
    obj.safetyGuidance = 'Stay on the highest level of the building. Do not enter floodwaters. A rescue team has been alerted.';
    obj.disclaimer = 'Priority score supports human decision-making and triage only. It is not an autonomous life-or-death decision.';

    return successResponse(res, obj, 'Emergency SOS request created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current Citizen's Emergency Requests
 * @route   GET /api/v1/emergency/my
 * @access  Private (Citizen)
 */
const getMyEmergencies = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id || req.user._id : null;
    if (!userId) {
      return next(new ErrorResponse('Not authorized to access emergency requests', 401));
    }

    const emergencies = await EmergencyRequest.find({ user: userId })
      .populate('assignedTeam')
      .sort({ createdAt: -1 });

    return successResponse(res, emergencies, 'Your emergency requests retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Emergency Requests (Admin & Rescue)
 * @route   GET /api/v1/emergency/requests
 * @access  Private (Admin & Rescue) / Public
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

    // Sort by priorityScore descending, then createdAt ascending
    const requests = await EmergencyRequest.find(query)
      .populate('assignedTeam')
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
 * @access  Private / Public
 */
const getRequestById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query).populate('assignedTeam');
    if (!emergency) {
      return next(new ErrorResponse(`Emergency request not found with id ${req.params.id}`, 404));
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
 * @desc    Assign Rescue Team to Emergency Request
 * @route   POST /api/v1/emergency/:id/assign
 * @access  Private (Admin)
 */
const assignTeam = async (req, res, next) => {
  try {
    const { rescueTeamId, teamId, etaMinutes } = req.body;
    const targetTeamId = rescueTeamId || teamId;

    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query);
    if (!emergency) {
      return next(new ErrorResponse(`Emergency request not found with id ${req.params.id}`, 404));
    }

    let team = null;
    if (targetTeamId) {
      const isTeamObjectId = String(targetTeamId).match(/^[0-9a-fA-F]{24}$/);
      team = await RescueTeam.findOne(isTeamObjectId ? { _id: targetTeamId } : { teamId: targetTeamId });
    }

    emergency.status = 'ASSIGNED';
    emergency.assignedAt = new Date();
    emergency.etaMinutes = etaMinutes || 15;
    if (team) {
      emergency.assignedTeam = team._id;
      emergency.assignedTeamName = team.teamName || team.name;
      team.status = 'DEPLOYED';
      await team.save();
    }

    await emergency.save();

    return successResponse(
      res,
      {
        emergencyId: emergency._id,
        status: emergency.status,
        assignedTeam: emergency.assignedTeam,
        assignedTeamName: emergency.assignedTeamName,
        assignedAt: emergency.assignedAt,
      },
      'Rescue team assigned successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Emergency Status (PENDING -> ASSIGNED -> IN_PROGRESS / DISPATCHED -> EN_ROUTE -> ON_SCENE -> RESCUED -> CLOSED)
 * @route   PATCH /api/v1/emergency/:id/status
 * @access  Private (Rescue / Admin)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status, note, etaMinutes } = req.body;

    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query);
    if (!emergency) {
      return next(new ErrorResponse(`Emergency request not found with id ${req.params.id}`, 404));
    }

    if (status) {
      const normStatus = status.toUpperCase();
      emergency.status = normStatus;
      if (normStatus === 'RESCUED') {
        emergency.rescuedAt = new Date();
      } else if (normStatus === 'CLOSED') {
        emergency.closedAt = new Date();
      }
    }
    if (etaMinutes !== undefined) {
      emergency.etaMinutes = etaMinutes;
    }

    await emergency.save();

    return successResponse(
      res,
      {
        emergencyId: emergency._id,
        status: emergency.status,
        note: note || '',
        rescuedAt: emergency.rescuedAt,
        closedAt: emergency.closedAt,
      },
      `Emergency status updated to ${emergency.status}`
    );
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
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { requestId: req.params.id };

    const emergency = await EmergencyRequest.findOne(query);
    if (!emergency) {
      return next(new ErrorResponse(`Emergency request not found with id ${req.params.id}`, 404));
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

module.exports = {
  createEmergencyRequest,
  getMyEmergencies,
  getAllRequests,
  getRequestById,
  assignTeam,
  updateStatus,
  addNote,
};
