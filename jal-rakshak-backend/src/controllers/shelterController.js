const mongoose = require('mongoose');
const Shelter = require('../models/Shelter');
const { ErrorResponse } = require('../middleware/errorHandler');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/helpers');
const { calculateDistanceKm } = require('../services/geospatialService');


/**
 * @desc    Get all shelters with filtering
 * @route   GET /api/v1/shelters
 * @access  Public
 */
const getAllShelters = async (req, res, next) => {
  try {
    const { district, status, facility, search } = req.query;

    const query = {};
    if (district) query.district = new RegExp(district, 'i');
    if (status) query.status = status.toUpperCase();
    if (facility) query.facilities = { $in: [new RegExp(facility, 'i')] };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { district: new RegExp(search, 'i') },
      ];
    }
    const shelters = await Shelter.find(query).sort({ totalCapacity: -1 });

    // If user provided coordinates, enrich with distanceKm and sort
    const userLat = Number(req.query.lat || req.query.latitude);
    const userLng = Number(req.query.lng || req.query.longitude);

    let enrichedShelters = shelters.map((s) => {
      const sObj = typeof s.toObject === 'function' ? s.toObject() : { ...s };
      if (!isNaN(userLat) && !isNaN(userLng) && s.location && s.location.coordinates) {
        const [lng, lat] = s.location.coordinates;
        sObj.distanceKm = calculateDistanceKm(userLat, userLng, lat, lng);
        sObj.lat = lat;
        sObj.lng = lng;
      } else if (s.location && s.location.coordinates) {
        sObj.lng = s.location.coordinates[0];
        sObj.lat = s.location.coordinates[1];
        sObj.distanceKm = sObj.distanceKm || 2.5;
      }
      return sObj;
    });

    if (!isNaN(userLat) && !isNaN(userLng)) {
      enrichedShelters.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return successResponse(res, enrichedShelters, 'Shelters retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Nearby Shelters using coordinates
 * @route   GET /api/v1/shelters/nearby
 * @access  Public
 */
const getNearbyShelters = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat || req.query.latitude || 20.4782);
    const lng = Number(req.query.lng || req.query.longitude || 85.8621);
    const maxDistanceMeters = Number(req.query.radius || 50000); // 50km default

    let shelters = [];
    try {
      shelters = await Shelter.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      });
    } catch (geoErr) {
      shelters = await Shelter.find();
    }

    const formatted = shelters.map((s) => {
      const obj = typeof s.toObject === 'function' ? s.toObject() : { ...s };
      const [sLng, sLat] = s.location ? s.location.coordinates : [85.86, 20.48];
      obj.distanceKm = calculateDistanceKm(lat, lng, sLat, sLng);
      obj.lat = sLat;
      obj.lng = sLng;
      return obj;
    });

    formatted.sort((a, b) => a.distanceKm - b.distanceKm);

    return successResponse(res, formatted, 'Nearby relief shelters retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single Shelter by ID
 * @route   GET /api/v1/shelters/:id
 * @access  Public
 */
const getShelterById = async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return next(new ErrorResponse(`Shelter not found with id ${req.params.id}`, 404));
    }
    return successResponse(res, shelter, 'Shelter retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a Shelter
 * @route   POST /api/v1/shelters
 * @access  Private (Admin)
 */
const createShelter = async (req, res, next) => {
  try {
    const { name, address, district, state, totalCapacity, currentOccupancy, facilities, contact, coordinates, lat, lng, locationName } = req.body;

    let coords = [85.8621, 20.4782];
    if (coordinates && Array.isArray(coordinates)) {
      coords = coordinates;
    } else if (lat !== undefined && lng !== undefined) {
      coords = [Number(lng), Number(lat)];
    }

    const shelter = await Shelter.create({
      name,
      address,
      district: district || 'Cuttack',
      state: state || 'Odisha',
      totalCapacity,
      currentOccupancy: currentOccupancy || 0,
      facilities: facilities || ['Medical Aid Camp', 'Drinking Water Plant', '24/7 Diesel Generator'],
      contact: contact || {},
      locationName: locationName || address,
      location: {
        type: 'Point',
        coordinates: coords,
      },
    });

    return successResponse(res, shelter, 'Shelter created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Shelter / Occupancy
 * @route   PUT /api/v1/shelters/:id
 * @route   PATCH /api/v1/shelters/:id
 * @access  Private (Admin / Rescue)
 */
const updateShelter = async (req, res, next) => {
  try {
    const { currentOccupancy, totalCapacity, status, facilities } = req.body;

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return next(new ErrorResponse(`Shelter not found with id ${req.params.id}`, 404));
    }

    if (currentOccupancy !== undefined) shelter.currentOccupancy = Number(currentOccupancy);
    if (totalCapacity !== undefined) shelter.totalCapacity = Number(totalCapacity);
    if (status) shelter.status = status;
    if (facilities) shelter.facilities = facilities;

    // Auto-update status if full
    if (shelter.currentOccupancy >= shelter.totalCapacity) {
      shelter.status = 'FULL';
    } else if (shelter.currentOccupancy / shelter.totalCapacity >= 0.85) {
      shelter.status = 'NEAR_FULL';
    } else if (shelter.status === 'FULL' && shelter.currentOccupancy < shelter.totalCapacity) {
      shelter.status = 'ACTIVE';
    }

    await shelter.save();

    return successResponse(res, shelter, 'Shelter updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Shelter
 * @route   DELETE /api/v1/shelters/:id
 * @access  Private (Admin)
 */
const deleteShelter = async (req, res, next) => {
  try {
    const shelter = await Shelter.findByIdAndDelete(req.params.id);
    if (!shelter) {
      return next(new ErrorResponse(`Shelter not found with id ${req.params.id}`, 404));
    }
    return successResponse(res, null, 'Shelter deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Shelter Occupancy
 * @route   PATCH /api/v1/shelters/:id/occupancy
 * @access  Private (Admin / Rescue)
 */
const updateOccupancy = async (req, res, next) => {
  try {
    const { currentOccupancy, notes } = req.body;

    if (currentOccupancy === undefined || isNaN(Number(currentOccupancy))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a valid numeric currentOccupancy value',
        },
      });
    }

    const occupancy = Number(currentOccupancy);
    if (occupancy < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current occupancy cannot be negative',
        },
      });
    }

    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      return next(new ErrorResponse(`Shelter not found with id ${req.params.id}`, 404));
    }

    if (occupancy > shelter.totalCapacity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CAPACITY_EXCEEDED',
          message: `Occupancy (${occupancy}) exceeds shelter total capacity (${shelter.totalCapacity})`,
        },
      });
    }

    shelter.currentOccupancy = occupancy;
    if (occupancy >= shelter.totalCapacity) {
      shelter.status = 'FULL';
    } else if (occupancy / shelter.totalCapacity >= 0.85) {
      shelter.status = 'NEAR_FULL';
    } else {
      shelter.status = 'ACTIVE';
    }

    await shelter.save();

    return successResponse(res, shelter, 'Shelter occupancy updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShelters,
  getNearbyShelters,
  getShelterById,
  createShelter,
  updateShelter,
  updateOccupancy,
  deleteShelter,
};

