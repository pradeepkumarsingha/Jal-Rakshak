const mongoose = require('mongoose');
const RescueTeam = require('../models/RescueTeam');
const RescueAssignment = require('../models/RescueAssignment');
const EmergencyRequest = require('../models/EmergencyRequest');
const AuditLog = require('../models/AuditLog');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');
const { notifyRescueStatusUpdated } = require('../socket');
const logger = require('../utils/logger');

// Valid state machine transitions
const VALID_TRANSITIONS = {
  ASSIGNED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['ON_SCENE', 'CANCELLED'],
  ON_SCENE: ['RESCUED', 'CANCELLED'],
  RESCUED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

/**
 * @desc    Get real Rescue Teams from MongoDB
 * @route   GET /api/v1/rescue/teams
 * @access  Private (Admin & Rescue)
 */
const getTeams = async (req, res, next) => {
  try {
    const { status, district } = req.query;
    const query = { isActive: true };

    if (status) query.status = status.toUpperCase();
    if (district) query.district = new RegExp(district, 'i');

    const teams = await RescueTeam.find(query)
      .populate('teamLead', 'fullName phone email')
      .populate('members', 'fullName phone role')
      .sort({ status: 1, teamName: 1 });

    const formatted = teams.map((t) => {
      const obj = t.toObject();
      if (t.currentLocation && t.currentLocation.coordinates) {
        obj.lng = t.currentLocation.coordinates[0];
        obj.lat = t.currentLocation.coordinates[1];
      }
      obj.id = t._id;
      return obj;
    });

    return successResponse(res, formatted, 'Rescue teams retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a Rescue Team
 * @route   POST /api/v1/rescue/teams
 * @access  Private (Admin)
 */
const createTeam = async (req, res, next) => {
  try {
    const {
      teamName,
      teamCode,
      district,
      state,
      latitude,
      longitude,
      vehicles,
      resources,
      teamLead,
      members,
    } = req.body;

    let coords = [85.8245, 20.2961];
    if (latitude !== undefined && longitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    }

    const code = teamCode || `NDRF-${Date.now().toString().slice(-4)}`;

    const team = await RescueTeam.create({
      teamName: teamName || '03rd NDRF Battalion Unit',
      teamCode: code.toUpperCase(),
      district: district || 'Cuttack',
      state: state || 'Odisha',
      currentLocation: {
        type: 'Point',
        coordinates: coords,
      },
      vehicles: vehicles || [
        { vehicleId: 'IRB-01', vehicleType: 'Inflatable Motor Boat', status: 'AVAILABLE', capacity: 8, fuelPercent: 100 },
      ],
      resources: resources || { lifeJackets: 25, firstAidKits: 6, rescueBoats: 2, ropes: 12 },
      status: 'AVAILABLE',
      teamLead: teamLead || (req.user ? req.user._id || req.user.id : null),
      members: members || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Rescue team created successfully',
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Active Rescue Assignments for logged-in Rescue User or Admin
 * @route   GET /api/v1/rescue/assignments
 * @access  Private (Rescue / Admin)
 */
const getAssignments = async (req, res, next) => {
  try {
    const user = req.user;
    let query = {
      assignmentStatus: { $nin: ['CLOSED', 'CANCELLED'] },
    };

    // If rescue role, filter by teams the user belongs to
    if (user && user.role === 'rescue') {
      const userTeams = await RescueTeam.find({
        $or: [{ teamLead: user._id || user.id }, { members: user._id || user.id }],
      }).select('_id');

      const teamIds = userTeams.map((t) => t._id);
      if (teamIds.length > 0) {
        query.rescueTeam = { $in: teamIds };
      }
    }

    const assignments = await RescueAssignment.find(query)
      .populate('emergencyRequest')
      .populate('rescueTeam')
      .populate('assignedBy', 'fullName role')
      .sort({ assignedAt: -1 });

    const formatted = assignments.map((a) => {
      const emergency = a.emergencyRequest;
      const team = a.rescueTeam;

      return {
        assignmentId: a._id,
        id: a._id,
        emergencyId: emergency?._id,
        requestId: emergency?.requestId,
        status: a.assignmentStatus,
        assignmentStatus: a.assignmentStatus,
        assignedAt: a.assignedAt,
        dispatchedAt: a.dispatchedAt,
        enRouteAt: a.enRouteAt,
        onSceneAt: a.onSceneAt,
        rescuedAt: a.rescuedAt,
        closedAt: a.closedAt,
        estimatedEtaMinutes: a.estimatedEtaMinutes,
        notes: a.notes,
        statusHistory: a.statusHistory,
        team: team
          ? {
              id: team._id,
              teamName: team.teamName,
              teamCode: team.teamCode,
              status: team.status,
            }
          : null,
        emergency: emergency
          ? {
              id: emergency._id,
              requestId: emergency.requestId,
              location: {
                latitude: emergency.location?.coordinates ? emergency.location.coordinates[1] : null,
                longitude: emergency.location?.coordinates ? emergency.location.coordinates[0] : null,
                address: emergency.address,
              },
              priorityScore: emergency.priorityScore,
              priorityLevel: emergency.priorityLevel,
              totalPeople: emergency.totalPeople,
              childrenCount: emergency.childrenCount,
              elderlyCount: emergency.elderlyCount,
              medicalEmergency: emergency.medicalEmergency,
              waterSeverity: emergency.waterSeverity,
              roadAccess: emergency.roadAccess,
              description: emergency.description,
              contact: emergency.contact,
              image: emergency.image,
            }
          : null,
      };
    });

    return successResponse(res, formatted, 'Rescue assignments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Assignment by ID
 * @route   GET /api/v1/rescue/assignments/:id
 * @access  Private (Rescue / Admin)
 */
const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await RescueAssignment.findById(req.params.id)
      .populate('emergencyRequest')
      .populate('rescueTeam')
      .populate('assignedBy', 'fullName role');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Assignment not found with id ${req.params.id}`,
          details: null,
        },
      });
    }

    // Role check: if rescue role, must be part of assigned team
    if (req.user && req.user.role === 'rescue') {
      const team = assignment.rescueTeam;
      const isMember =
        team &&
        (String(team.teamLead) === String(req.user._id || req.user.id) ||
          (team.members && team.members.some((m) => String(m) === String(req.user._id || req.user.id))));

      if (!isMember && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not authorized to view another rescue team’s assignment',
            details: null,
          },
        });
      }
    }

    return successResponse(res, assignment, 'Assignment retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Rescue Assignment & Emergency Status (ASSIGNED -> DISPATCHED -> EN_ROUTE -> ON_SCENE -> RESCUED -> CLOSED)
 * @route   PATCH /api/v1/rescue/assignments/:assignmentId/status
 * @access  Private (Assigned Rescue Team / Admin)
 */
const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status, note, etaMinutes } = req.body;
    const normStatus = String(status || '').toUpperCase();

    if (!normStatus) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status field is required',
          details: null,
        },
      });
    }

    const assignment = await RescueAssignment.findById(req.params.assignmentId)
      .populate('emergencyRequest')
      .populate('rescueTeam');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Rescue assignment not found with id ${req.params.assignmentId}`,
          details: null,
        },
      });
    }

    const user = req.user;
    const isAdmin = user && user.role === 'admin';
    const team = assignment.rescueTeam;

    // Authorization check
    if (!isAdmin) {
      const isTeamMember =
        team &&
        (String(team.teamLead) === String(user._id || user.id) ||
          (team.members && team.members.some((m) => String(m) === String(user._id || user.id))));

      if (!isTeamMember) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only members of the assigned rescue team or administrators can update mission status',
            details: null,
          },
        });
      }
    }

    // State transition validation
    const currentStatus = assignment.assignmentStatus;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(normStatus) && !isAdmin) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot transition status from ${currentStatus} to ${normStatus}. Allowed: ${allowedNext.join(', ') || 'None'}`,
          details: { currentStatus, requestedStatus: normStatus, allowedNext },
        },
      });
    }

    const now = new Date();

    // Update assignment milestones
    assignment.assignmentStatus = normStatus;
    if (etaMinutes !== undefined) assignment.estimatedEtaMinutes = Number(etaMinutes);

    if (normStatus === 'DISPATCHED') assignment.dispatchedAt = now;
    if (normStatus === 'EN_ROUTE') assignment.enRouteAt = now;
    if (normStatus === 'ON_SCENE') assignment.onSceneAt = now;
    if (normStatus === 'RESCUED') assignment.rescuedAt = now;
    if (normStatus === 'CLOSED') assignment.closedAt = now;

    // Append to status history
    assignment.statusHistory.push({
      status: normStatus,
      changedBy: user ? user._id || user.id : null,
      changedAt: now,
      note: note || `Status transitioned to ${normStatus}`,
    });

    if (note) {
      assignment.notes.push({
        message: note,
        createdBy: user ? user._id || user.id : null,
        createdAt: now,
      });
    }

    await assignment.save();

    // Update EmergencyRequest
    const emergency = await EmergencyRequest.findById(assignment.emergencyRequest?._id || assignment.emergencyRequest);
    if (emergency) {
      emergency.status = normStatus;
      if (normStatus === 'RESCUED') emergency.rescuedAt = now;
      if (normStatus === 'CLOSED') emergency.closedAt = now;
      if (etaMinutes !== undefined) emergency.etaMinutes = Number(etaMinutes);

      emergency.statusHistory.push({
        status: normStatus,
        changedBy: user ? user._id || user.id : null,
        changedAt: now,
        note: note || `Status updated by ${user?.fullName || 'Rescue unit'}`,
      });

      await emergency.save();
    }

    // If mission CLOSED, check if team can be made AVAILABLE
    if (normStatus === 'CLOSED' && team) {
      const otherActive = await RescueAssignment.countDocuments({
        rescueTeam: team._id,
        assignmentStatus: { $in: ['ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE'] },
        _id: { $ne: assignment._id },
      });

      if (otherActive === 0) {
        await RescueTeam.findByIdAndUpdate(team._id, { status: 'AVAILABLE' });
      }
    }

    // Create Audit Log
    await AuditLog.create({
      user: user ? user._id || user.id : null,
      actorRole: user?.role || 'rescue',
      action: 'RESCUE_STATUS_UPDATED',
      entityType: 'RescueAssignment',
      entityId: assignment._id,
      details: {
        previousStatus: currentStatus,
        newStatus: normStatus,
        emergencyId: emergency?._id,
        teamId: team?._id,
        note,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch((err) => logger.warn(`AuditLog creation warning: ${err.message}`));

    // Emit real-time Socket.IO notifications
    notifyRescueStatusUpdated(emergency || { _id: assignment.emergencyRequest, user: null }, assignment, team);

    return res.status(200).json({
      success: true,
      message: `Mission status successfully updated to ${normStatus}`,
      data: {
        assignmentId: assignment._id,
        emergencyId: emergency?._id,
        status: normStatus,
        updatedAt: now,
        estimatedEtaMinutes: assignment.estimatedEtaMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Rescue Team Status
 * @route   PATCH /api/v1/rescue/teams/:id/status
 * @access  Private (Admin / Rescue)
 */
const updateTeamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rescue team not found', details: null },
      });
    }

    if (status) {
      team.status = status.toUpperCase();
      await team.save();
    }

    return successResponse(res, team, `Team status updated to ${team.status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Rescue Team Telemetry Location
 * @route   PATCH /api/v1/rescue/teams/:id/location
 * @access  Private (Rescue)
 */
const updateTeamLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, lat, lng } = req.body;
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rescue team not found', details: null },
      });
    }

    const resolvedLat = latitude !== undefined ? Number(latitude) : Number(lat);
    const resolvedLng = longitude !== undefined ? Number(longitude) : Number(lng);

    if (isNaN(resolvedLat) || isNaN(resolvedLng)) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid latitude and longitude are required', details: null },
      });
    }

    team.currentLocation = {
      type: 'Point',
      coordinates: [resolvedLng, resolvedLat],
    };
    await team.save();

    return successResponse(res, team, 'Team location updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  createTeam,
  getAssignments,
  getAssignmentById,
  updateAssignmentStatus,
  updateTeamStatus,
  updateTeamLocation,
};
