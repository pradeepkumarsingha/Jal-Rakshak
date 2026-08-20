const Shelter = require('../models/Shelter');
const CitizenReport = require('../models/CitizenReport');
const EmergencyRequest = require('../models/EmergencyRequest');
const RescueTeam = require('../models/RescueTeam');
const { geospatialService, aiService } = require('../services');
const { successResponse, errorResponse } = require('../utils/helpers');

// Base Risk Polygons in GeoJSON Format
const RISK_FEATURES = [
  {
    type: 'Feature',
    properties: {
      id: 'ZONE-RED-01',
      name: 'Mahanadi Lower Basin - Bidanasi to Nuapatna',
      district: 'Cuttack',
      state: 'Odisha',
      severity: 'CRITICAL',
      riskScore: 94,
      color: '#DC2626',
      fillOpacity: 0.45,
      waterDepth: '1.2m - 2.4m',
      populationAtRisk: 34500,
      status: 'EVACUATION_MANDATORY',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [85.845, 20.475],
          [85.855, 20.490],
          [85.875, 20.495],
          [85.885, 20.482],
          [85.865, 20.468],
          [85.845, 20.475],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'ZONE-ORANGE-02',
      name: 'Kathajodi River Front - Chauliaganj & Khan Nagar',
      district: 'Cuttack',
      state: 'Odisha',
      severity: 'HIGH',
      riskScore: 74,
      color: '#EA580C',
      fillOpacity: 0.35,
      waterDepth: '0.5m - 1.2m',
      populationAtRisk: 22000,
      status: 'HIGH_ALERT_PREPAREDNESS',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [85.885, 20.450],
          [85.905, 20.465],
          [85.930, 20.460],
          [85.920, 20.445],
          [85.895, 20.440],
          [85.885, 20.450],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'ZONE-YELLOW-03',
      name: 'Puri Lowland Catchment - Nimapara & Gop',
      district: 'Puri',
      state: 'Odisha',
      severity: 'MEDIUM',
      riskScore: 52,
      color: '#CA8A04',
      fillOpacity: 0.3,
      waterDepth: '0.2m - 0.5m',
      populationAtRisk: 15800,
      status: 'WATCH_AND_PREPARE',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [85.890, 20.380],
          [85.920, 20.410],
          [85.960, 20.395],
          [85.940, 20.365],
          [85.890, 20.380],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'ZONE-GREEN-04',
      name: 'Bhubaneswar High-Ground Plateau (Patia / Chandaka)',
      district: 'Khordha',
      state: 'Odisha',
      severity: 'LOW',
      riskScore: 18,
      color: '#16A34A',
      fillOpacity: 0.2,
      waterDepth: '0.0m (Dry & Elevated)',
      populationAtRisk: 0,
      status: 'SAFE_EVACUATION_DESTINATION',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [85.800, 20.340],
          [85.810, 20.370],
          [85.845, 20.365],
          [85.835, 20.335],
          [85.800, 20.340],
        ],
      ],
    },
  },
];

/**
 * @desc    Get GIS Flood Risk Map FeatureCollection
 * @route   GET /api/v1/gis/risk-map
 * @access  Private / Public
 */
const getRiskMap = async (req, res, next) => {
  try {
    const { district, state, window: timeWindow } = req.query;

    let features = RISK_FEATURES;
    if (district) {
      features = features.filter(
        (f) => f.properties.district && f.properties.district.toLowerCase() === district.toLowerCase()
      );
      if (features.length === 0) features = RISK_FEATURES; // fallback to show full basin
    }

    const geoJson = {
      type: 'FeatureCollection',
      window: timeWindow || 'current',
      features,
    };

    return res.status(200).json({
      success: true,
      data: geoJson,
      message: 'GIS risk map GeoJSON retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Nearby Shelters using MongoDB $near or distance
 * @route   GET /api/v1/gis/shelters
 * @access  Private / Public
 */
const getSheltersGis = async (req, res, next) => {
  try {
    const { latitude, longitude, radiusKm } = req.query;

    let shelters = [];
    if (latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      const maxDistanceMeters = (Number(radiusKm) || 10) * 1000;

      try {
        shelters = await Shelter.find({
          location: {
            $near: {
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
    } else {
      shelters = await Shelter.find();
    }

    // Format shelter points for Map / GIS
    const formatted = shelters.map((s) => {
      const obj = s.toObject();
      if (s.location && s.location.coordinates) {
        obj.lng = s.location.coordinates[0];
        obj.lat = s.location.coordinates[1];
      }
      return obj;
    });

    return successResponse(res, formatted, 'GIS shelters retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate Safe Evacuation Route
 * @route   POST /api/v1/gis/safe-route
 * @access  Private / Public
 */
const calculateSafeRoute = async (req, res, next) => {
  try {
    const { origin, destination, mode, avoidFloodZones } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide origin and destination coordinates',
        },
      });
    }

    const route = await aiService.getSafeRoute({
      origin,
      destination,
      mode: mode || 'pedestrian',
      avoidFloodZones: avoidFloodZones !== false,
    });

    return successResponse(res, route, 'Safe evacuation route generated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Live Reports on map within bounding box
 * @route   GET /api/v1/gis/reports
 * @access  Private / Public
 */
const getLiveReportsGis = async (req, res, next) => {
  try {
    const { bbox, verifiedOnly } = req.query;

    const query = {};
    if (verifiedOnly === 'true') {
      query.verificationStatus = 'VERIFIED';
    }

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      if (!isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
        query.location = {
          $geoWithin: {
            $box: [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
          },
        };
      }
    }

    const reports = await CitizenReport.find(query).sort({ createdAt: -1 }).limit(100);
    return successResponse(res, reports, 'Live map reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Live Emergencies on map within bounding box
 * @route   GET /api/v1/gis/emergencies
 * @access  Private / Public
 */
const getLiveEmergenciesGis = async (req, res, next) => {
  try {
    const { bbox, status } = req.query;

    const query = {};
    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE'] };
      } else {
        query.status = status.toUpperCase();
      }
    }

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      if (!isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
        query.location = {
          $geoWithin: {
            $box: [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
          },
        };
      }
    }

    const emergencies = await EmergencyRequest.find(query).sort({ priorityScore: -1, createdAt: 1 }).limit(100);
    return successResponse(res, emergencies, 'Live emergency map incidents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Rescue Unit Locations
 * @route   GET /api/v1/gis/rescue-units
 * @access  Private (Admin & Rescue only)
 */
const getRescueUnitsGis = async (req, res, next) => {
  try {
    const units = await RescueTeam.find();
    return successResponse(res, units, 'Rescue units telemetry retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRiskMap,
  getSheltersGis,
  calculateSafeRoute,
  getLiveReportsGis,
  getLiveEmergenciesGis,
  getRescueUnitsGis,
};
