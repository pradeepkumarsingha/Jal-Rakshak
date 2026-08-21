const axios = require('axios');
const Shelter = require('../models/Shelter');
const CitizenReport = require('../models/CitizenReport');
const Alert = require('../models/Alert');
const { aiService } = require('../services');
const { successResponse, errorResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Reverse geocode coordinates to location / district / state
 */
async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'JalRakshak-DisasterPlatform/1.0 (contact@jalrakshak.org)',
      },
      timeout: 3500,
    });

    const data = response.data;
    if (data && data.address) {
      const addr = data.address;
      const name =
        addr.city ||
        addr.town ||
        addr.suburb ||
        addr.village ||
        addr.municipality ||
        addr.neighbourhood ||
        addr.hamlet ||
        addr.county ||
        data.name ||
        'Current location';

      const district =
        addr.state_district ||
        addr.county ||
        addr.district ||
        (addr.city ? `${addr.city}` : null);

      const state = addr.state || 'Odisha';

      return {
        latitude,
        longitude,
        name,
        district,
        state,
        source: 'gps',
        geocodingStatus: 'LIVE',
      };
    }
  } catch (err) {
    logger.warn(`Reverse geocoding unavailable for [${latitude}, ${longitude}]: ${err.message}`);
  }

  // Honest fallback - NEVER default to Cuttack
  return {
    latitude,
    longitude,
    name: 'Current location',
    district: null,
    state: null,
    source: 'coordinates',
    geocodingStatus: 'UNAVAILABLE',
  };
}

/**
 * Fetch live coordinate weather from Open-Meteo
 */
async function fetchCoordinateWeather(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,rain&forecast_days=2`;
    const response = await axios.get(url, { timeout: 4000 });
    return {
      status: 'LIVE',
      data: response.data,
    };
  } catch (err) {
    logger.warn(`Weather API unavailable for [${latitude}, ${longitude}]: ${err.message}`);
    return {
      status: 'UNAVAILABLE',
      data: null,
    };
  }
}

/**
 * @desc    Get Unified Location Dashboard Data
 * @route   GET /api/v1/dashboard/location
 * @access  Private (JWT)
 */
const getLocationDashboard = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return errorResponse(res, 'Invalid latitude. Must be a valid number between -90 and 90.', 400);
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return errorResponse(res, 'Invalid longitude. Must be a valid number between -180 and 180.', 400);
    }

    // Execute independent tasks in parallel with Promise.allSettled
    const [
      geoResult,
      weatherResult,
      sheltersResult,
      reportsResult,
      alertsResult,
    ] = await Promise.allSettled([
      reverseGeocode(lat, lng),
      fetchCoordinateWeather(lat, lng),
      // Query nearby shelters within 50km
      Shelter.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 50000,
          },
        },
      })
        .limit(6)
        .catch(async () => {
          // Fallback if 2dsphere index / coordinates not yet indexed
          return Shelter.find({ status: 'ACTIVE' }).limit(6);
        }),
      // Query nearby verified citizen reports
      CitizenReport.find({
        verificationStatus: 'VERIFIED',
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .catch(() => []),
      // Query active alerts
      Alert.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .catch(() => []),
    ]);

    const location =
      geoResult.status === 'fulfilled'
        ? geoResult.value
        : {
            latitude: lat,
            longitude: lng,
            name: 'Current location',
            district: null,
            state: null,
            source: 'coordinates',
            geocodingStatus: 'UNAVAILABLE',
          };

    const weatherPayload = weatherResult.status === 'fulfilled' ? weatherResult.value : { status: 'UNAVAILABLE', data: null };
    const nearbyShelters = sheltersResult.status === 'fulfilled' && sheltersResult.value ? sheltersResult.value : [];
    const nearbyReports = reportsResult.status === 'fulfilled' && reportsResult.value ? reportsResult.value : [];
    const alerts = alertsResult.status === 'fulfilled' && alertsResult.value ? alertsResult.value : [];

    // Rainfall extraction from weather
    const currentRainMm = weatherPayload.data?.current?.rain || weatherPayload.data?.current?.precipitation || 0;

    // Fetch Flood Risk & Hydrograph for the exact coordinates
    const [floodRiskRes, forecastRes] = await Promise.allSettled([
      aiService.predictFlood({
        latitude: lat,
        longitude: lng,
        locationName: location.name || 'Current location',
        rainfallForecastMm: currentRainMm,
        weatherData: weatherPayload.data,
        simulationMode: false,
      }),
      aiService.getForecast({
        latitude: lat,
        longitude: lng,
        hours: 24,
      }),
    ]);

    const floodRisk =
      floodRiskRes.status === 'fulfilled'
        ? floodRiskRes.value
        : {
            location: location.name,
            riskScore: null,
            riskLevel: 'UNKNOWN',
            source: 'unavailable',
            message: 'Flood inference service temporarily estimating for these coordinates.',
          };

    const forecast =
      forecastRes.status === 'fulfilled' && Array.isArray(forecastRes.value)
        ? forecastRes.value
        : [];

    const responsePayload = {
      location,
      weather: weatherPayload.data || {},
      floodRisk,
      forecast,
      nearbyShelters,
      alerts,
      nearbyReports,
      dataStatus: {
        weather: weatherPayload.status,
        geocoding: location.geocodingStatus,
        floodRisk: floodRisk.riskScore !== null ? 'LIVE' : 'ESTIMATED',
        lastUpdated: new Date().toISOString(),
      },
    };

    return successResponse(res, responsePayload, 'Unified location dashboard data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocationDashboard,
  reverseGeocode,
};
