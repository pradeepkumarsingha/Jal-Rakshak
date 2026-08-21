const FloodPrediction = require('../models/FloodPrediction');
const { aiService } = require('../services');
const { successResponse, errorResponse } = require('../utils/helpers');
const { RIVERS_TELEMETRY } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @desc    Predict Flood Risk for coordinates / location
 * @route   POST /api/v1/flood/predict
 * @access  Private / Public
 */
const predictFlood = async (req, res, next) => {
  try {
    const { latitude, longitude, coordinates, location, locationName, simulationMode } = req.body;

    const lat = latitude !== undefined ? Number(latitude) : coordinates ? Number(coordinates[1]) : null;
    const lng = longitude !== undefined ? Number(longitude) : coordinates ? Number(coordinates[0]) : null;

    if (lat === null || isNaN(lat) || lat < -90 || lat > 90) {
      return errorResponse(res, 'Valid latitude between -90 and 90 is required.', 400);
    }
    if (lng === null || isNaN(lng) || lng < -180 || lng > 180) {
      return errorResponse(res, 'Valid longitude between -180 and 180 is required.', 400);
    }

    const locName = locationName || (typeof location === 'string' ? location : 'Current location');
    const isSim = Boolean(simulationMode);

    const rawPrediction = await aiService.predictFlood({
      latitude: lat,
      longitude: lng,
      locationName: locName,
      location: locName,
      coordinates: [lng, lat],
      simulationMode: isSim,
    });

    const calculatedScore = rawPrediction.riskScore !== undefined ? rawPrediction.riskScore : null;
    const calculatedLevel = rawPrediction.riskLevel || (calculatedScore !== null ? (calculatedScore >= 75 ? 'CRITICAL' : calculatedScore >= 50 ? 'HIGH' : 'LOW') : 'UNKNOWN');

    const formattedData = {
      riskScore: calculatedScore,
      riskLevel: calculatedLevel,
      location: {
        latitude: lat,
        longitude: lng,
        name: locName,
      },
      forecast: {
        current: { score: calculatedScore, level: calculatedLevel },
        '6h': { score: calculatedScore !== null ? Math.min(100, calculatedScore + 2) : null, level: calculatedLevel },
        '12h': { score: calculatedScore !== null ? Math.min(100, calculatedScore + 4) : null, level: calculatedLevel },
        '24h': { score: calculatedScore !== null ? Math.max(10, calculatedScore - 2) : null, level: calculatedLevel },
      },
      factors: rawPrediction.factors || [
        { name: 'Catchment Runoff', value: `${calculatedScore || 20}% Index`, impact: 'MEDIUM' },
        { name: 'Soil Moisture', value: `${rawPrediction.soilSaturationPct || 40}% Saturated`, impact: 'LOW' },
      ],
      contributingFactors: rawPrediction.factors || [],
      predictedInundationDepth: rawPrediction.predictedInundationDepth || '0.15 meters',
      modelVersion: rawPrediction.modelVersion || 'JalRakshak-HydroML-v2.4',
      source: isSim ? 'simulation' : (rawPrediction.source || 'live'),
      isSimulation: isSim || Boolean(rawPrediction.isSimulation),
      lastUpdated: new Date().toISOString(),
      disclaimer: isSim
        ? 'Demonstration simulation scenario data.'
        : 'AI prediction represents statistical hydrological estimates based on real-time precipitation and terrain topology.',
    };

    // Save record to DB
    if (!isSim && calculatedScore !== null) {
      try {
        await FloodPrediction.create({
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          locationName: locName,
          riskScore: formattedData.riskScore,
          riskLevel: formattedData.riskLevel,
          predictedInundationDepth: formattedData.predictedInundationDepth,
          rainfallForecastMm: rawPrediction.rainfallForecastMm || 0,
          soilSaturationPct: rawPrediction.soilSaturationPct || 40,
          contributingFactors: formattedData.contributingFactors,
        });
      } catch (err) {
        logger.warn(`Could not persist flood prediction to DB: ${err.message}`);
      }
    }

    return successResponse(res, formattedData, 'Flood prediction calculated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Flood Hydrograph Forecast
 * @route   GET /api/v1/flood/forecast
 * @access  Private / Public
 */
const getForecast = async (req, res, next) => {
  try {
    const { latitude, longitude, hours, simulationMode } = req.query;
    const isSim = simulationMode === 'true' || simulationMode === true;
    const forecast = await aiService.getForecast({
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      hours: hours ? Number(hours) : 24,
      simulationMode: isSim,
    });
    return successResponse(res, forecast, 'Flood forecast retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Historical Flood Predictions
 * @route   GET /api/v1/flood/history
 * @access  Private / Public
 */
const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const history = await FloodPrediction.find().sort({ createdAt: -1 }).limit(limit);
    return successResponse(res, history, 'Historical flood records retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Risk Prediction by Location
 * @route   GET /api/v1/flood/risk/:location
 * @access  Public
 */
const getRiskByLocation = async (req, res, next) => {
  try {
    const locationName = decodeURIComponent(req.params.location || 'Cuttack');
    const prediction = await aiService.predictFlood({
      locationName,
      location: locationName,
    });
    return successResponse(res, prediction, `Risk assessment for ${locationName}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get River Gauge Telemetry
 * @route   GET /api/v1/flood/rivers
 * @access  Public
 */
const getRiversTelemetry = async (req, res, next) => {
  try {
    return successResponse(res, RIVERS_TELEMETRY, 'River telemetry retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predictFlood,
  getForecast,
  getHistory,
  getRiskByLocation,
  getRiversTelemetry,
};
