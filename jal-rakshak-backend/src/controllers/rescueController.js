const RescueTeam = require('../models/RescueTeam');
const EmergencyRequest = require('../models/EmergencyRequest');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @desc    Get all Rescue Teams
 * @route   GET /api/v1/rescue/teams
 * @access  Private (Admin & Rescue) / Public
 */
const getTeams = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status.toUpperCase();

    const teams = await RescueTeam.find(query).populate('activeMissionId');

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
    const { teamName, battalion, leaderName, contactPhone, memberCount, boatsCount, equipment, specialization, latitude, longitude } = req.body;

    let coords = [85.8900, 20.4700];
    if (latitude !== undefined && longitude !== undefined) {
      coords = [Number(longitude), Number(latitude)];
    }

    const team = await RescueTeam.create({
      teamId: `TEAM-${Date.now().toString().slice(-4)}`,
      teamName: teamName || '03rd NDRF Battalion Unit',
      battalion: battalion || '03rd NDRF Battalion, Mundali',
      leaderName: leaderName || 'Cmdr. Vikram Rathore',
      contactPhone: contactPhone || '+91 98110 54321',
      memberCount: memberCount || 12,
      boatsCount: boatsCount || 4,
      status: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: coords,
      },
      equipment: equipment || ['Inflatable Boats', 'Life Jackets', 'Medical Kits', 'Satellite Comms'],
      specialization: specialization || ['Swift Water Rescue', 'Flood Evacuation'],
    });

    return successResponse(res, team, 'Rescue team created successfully', 201);
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
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { teamId: req.params.id };

    const team = await RescueTeam.findOne(query);
    if (!team) {
      return next(new ErrorResponse(`Rescue team not found with id ${req.params.id}`, 404));
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
 * @desc    Update Rescue Team Location
 * @route   PATCH /api/v1/rescue/teams/:id/location
 * @access  Private (Rescue)
 */
const updateTeamLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, lat, lng } = req.body;
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { teamId: req.params.id };

    const team = await RescueTeam.findOne(query);
    if (!team) {
      return next(new ErrorResponse(`Rescue team not found with id ${req.params.id}`, 404));
    }

    const resolvedLat = latitude !== undefined ? Number(latitude) : Number(lat);
    const resolvedLng = longitude !== undefined ? Number(longitude) : Number(lng);

    if (isNaN(resolvedLat) || isNaN(resolvedLng)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid latitude and longitude coordinates are required',
        },
      });
    }

    team.currentLocation = {
      type: 'Point',
      coordinates: [resolvedLng, resolvedLat],
    };
    await team.save();

    return successResponse(res, team, 'Team location telemetry updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Active Rescue Assignments
 * @route   GET /api/v1/rescue/assignments
 * @access  Private (Rescue)
 */
const getAssignments = async (req, res, next) => {
  try {
    const assignments = await EmergencyRequest.find({
      status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE'] },
    })
      .populate('assignedTeam')
      .sort({ priorityScore: -1, createdAt: 1 });

    const formatted = assignments.map((r) => {
      const obj = r.toObject();
      if (r.location && r.location.coordinates) {
        obj.lng = r.location.coordinates[0];
        obj.lat = r.location.coordinates[1];
      }
      obj.id = r._id;
      return obj;
    });

    return successResponse(res, formatted, 'Active rescue assignments retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  createTeam,
  updateTeamStatus,
  updateTeamLocation,
  getAssignments,
};
