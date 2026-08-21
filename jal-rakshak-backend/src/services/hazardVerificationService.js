const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

const VERIFICATION_URL =
  process.env.HAZARD_VERIFICATION_URL || 'https://ai-report-hazard.vercel.app/verify-image';
const TIMEOUT_MS = Number(process.env.HAZARD_VERIFICATION_TIMEOUT_MS) || 60000;

/**
 * Creates fallback unavailable response when model service is offline or errors
 * @param {string} reason
 * @param {Object} raw
 * @returns {Object} Normalized unavailable result
 */
const createUnavailableResult = (reason = 'Verification model unavailable', raw = {}) => {
  return {
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
    source: 'model_unavailable',
    isEstimate: true,
    requiresHumanVerification: true,
    analyzedAt: new Date(),
    rawResponse: {
      reason,
      ...raw,
    },
  };
};

/**
 * Normalizes raw responses from the deployed AI Hazard verification service
 * Matches exact response: { is_genuine: true, verdict: "genuine", severity: "HIGH", message: "..." }
 * @param {Object} raw - Raw API response data
 * @returns {Object} Normalized hazard schema
 */
const normalizeVerificationResponse = (raw = {}) => {
  if (!raw || typeof raw !== 'object') {
    return createUnavailableResult('Empty or non-object response from model');
  }

  // 1. Flood detection flag
  let floodDetected = null;
  if (raw.is_genuine !== undefined) {
    floodDetected = Boolean(raw.is_genuine);
  } else if (raw.isGenuine !== undefined) {
    floodDetected = Boolean(raw.isGenuine);
  } else if (raw.verdict !== undefined) {
    floodDetected = String(raw.verdict).toLowerCase() === 'genuine';
  } else if (raw.floodDetected !== undefined) {
    floodDetected = Boolean(raw.floodDetected);
  } else if (raw.flood_detected !== undefined) {
    floodDetected = Boolean(raw.flood_detected);
  }

  // 2. Severity normalization
  let severity = 'UNKNOWN';
  const rawSev = String(raw.severity ?? raw.riskLevel ?? raw.level ?? raw.severity_level ?? '').toUpperCase();
  if (['LOW', 'MEDIUM', 'HIGH', 'SEVERE'].includes(rawSev)) {
    severity = rawSev;
  } else if (rawSev.includes('CRIT') || rawSev.includes('EXTREME') || rawSev.includes('SEVERE')) {
    severity = 'SEVERE';
  } else if (rawSev.includes('HIGH')) {
    severity = 'HIGH';
  } else if (rawSev.includes('MOD') || rawSev.includes('MED')) {
    severity = 'MEDIUM';
  } else if (rawSev.includes('LOW') || rawSev.includes('MINOR')) {
    severity = 'LOW';
  } else if (rawSev.includes('NORMAL')) {
    severity = floodDetected ? 'LOW' : 'UNKNOWN';
  } else if (floodDetected) {
    severity = 'HIGH';
  }

  // 3. Confidence score
  let confidence = null;
  const rawConf = raw.confidence ?? raw.score ?? raw.probability ?? raw.aiConfidence;
  if (rawConf !== undefined && rawConf !== null) {
    const numConf = Number(rawConf);
    confidence = !isNaN(numConf) ? (numConf > 1 ? Number((numConf / 100).toFixed(2)) : Number(numConf.toFixed(2))) : null;
  } else if (floodDetected !== null) {
    confidence = floodDetected ? 0.95 : 0.90;
  }

  // 4. Road Condition based on severity
  let roadCondition = 'UNKNOWN';
  const rawRoad = String(raw.roadCondition ?? raw.roadStatus ?? raw.road_status ?? '').toUpperCase();
  if (['OPEN', 'PARTIALLY_BLOCKED', 'BLOCKED'].includes(rawRoad)) {
    roadCondition = rawRoad;
  } else if (severity === 'SEVERE' || severity === 'HIGH') {
    roadCondition = 'BLOCKED';
  } else if (severity === 'MEDIUM') {
    roadCondition = 'PARTIALLY_BLOCKED';
  } else if (severity === 'LOW') {
    roadCondition = 'OPEN';
  }

  // 5. Travel recommendation
  let vehicleTravelRecommendation = 'UNKNOWN';
  if (severity === 'SEVERE' || severity === 'HIGH') {
    vehicleTravelRecommendation = 'NOT_RECOMMENDED';
  } else if (severity === 'MEDIUM') {
    vehicleTravelRecommendation = 'CAUTION';
  } else if (severity === 'LOW') {
    vehicleTravelRecommendation = 'RECOMMENDED';
  }

  // 6. Water depth estimation
  let estimatedWaterDepthMeters = null;
  const rawDepth = raw.estimatedWaterDepthMeters ?? raw.waterDepth ?? raw.estimatedWaterDepth ?? raw.depth;
  if (rawDepth !== undefined && rawDepth !== null) {
    const numDepth = parseFloat(String(rawDepth).replace(/[^0-9.]/g, ''));
    estimatedWaterDepthMeters = !isNaN(numDepth) ? Number(numDepth.toFixed(2)) : null;
  } else if (severity === 'SEVERE') {
    estimatedWaterDepthMeters = 1.5;
  } else if (severity === 'HIGH') {
    estimatedWaterDepthMeters = 1.0;
  } else if (severity === 'MEDIUM') {
    estimatedWaterDepthMeters = 0.5;
  } else if (severity === 'LOW') {
    estimatedWaterDepthMeters = 0.2;
  }

  return {
    status: 'COMPLETED',
    floodDetected,
    confidence,
    severity,
    estimatedWaterDepthMeters,
    waterCoveragePercent: raw.waterCoveragePercent || (floodDetected ? 75 : 0),
    roadCondition,
    vehicleTravelRecommendation,
    hazardObjects: Array.isArray(raw.hazardObjects) ? raw.hazardObjects : floodDetected ? ['floodwater', 'submerged_area'] : [],
    modelName: 'ai-report-hazard',
    modelVersion: 'v1.0',
    source: 'deployed_hazard_verification_model',
    isEstimate: true,
    requiresHumanVerification: true,
    analyzedAt: new Date(),
    rawResponse: raw,
  };
};

/**
 * Sends image buffer directly as multipart/form-data with field name 'file'
 * @param {Buffer} buffer - Image file buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - Image MIME type
 * @returns {Promise<Object>} Normalized analysis
 */
const verifyImageByMultipart = async (buffer, filename = 'hazard.jpg', mimetype = 'image/jpeg') => {
  if (!buffer) {
    return createUnavailableResult('No image buffer provided');
  }

  try {
    const formData = new FormData();
    // Endpoint expects field name 'file'
    formData.append('file', buffer, {
      filename: filename || 'flood.jpg',
      contentType: mimetype || 'image/jpeg',
    });

    logger.info(`Sending multipart 'file' to hazard model: ${VERIFICATION_URL}`);
    const response = await axios.post(VERIFICATION_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        accept: 'application/json',
      },
      timeout: TIMEOUT_MS,
    });

    logger.info(`Hazard model responded: ${JSON.stringify(response.data)}`);
    return normalizeVerificationResponse(response.data);
  } catch (error) {
    logger.warn(`Hazard image verification failed: ${error.message}`);
    const errorDetails = error.response?.data || null;
    return createUnavailableResult(error.message, { errorDetails });
  }
};

/**
 * Downloads image from URL and sends as multipart 'file' to the model
 * @param {string} imageUrl - Public secure image URL
 * @returns {Promise<Object>} Normalized analysis
 */
const verifyImageByUrl = async (imageUrl) => {
  if (!imageUrl) {
    return createUnavailableResult('No image URL provided');
  }

  try {
    logger.info(`Fetching image from URL to forward to hazard model: ${imageUrl}`);
    const imgRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'JalRakshak-Server/2.0' },
      timeout: 20000,
    });

    const buffer = Buffer.from(imgRes.data);
    const contentType = imgRes.headers['content-type'] || 'image/jpeg';
    return verifyImageByMultipart(buffer, 'image.jpg', contentType);
  } catch (error) {
    logger.warn(`Failed to fetch image URL for hazard verification: ${error.message}`);
    return createUnavailableResult(error.message, { errorDetails: error.response?.data || null });
  }
};

/**
 * Main verify function that executes multipart 'file' submission
 * @param {Object} params - { imageUrl, buffer, filename, mimetype }
 * @returns {Promise<Object>} Normalized analysis
 */
const verifyHazardImage = async ({ imageUrl, buffer, filename, mimetype }) => {
  if (buffer && Buffer.isBuffer(buffer) && buffer.length > 0) {
    return verifyImageByMultipart(buffer, filename, mimetype);
  }
  if (imageUrl) {
    return verifyImageByUrl(imageUrl);
  }
  return createUnavailableResult('Neither image buffer nor image URL provided');
};

module.exports = {
  verifyImageByUrl,
  verifyImageByMultipart,
  verifyHazardImage,
  normalizeVerificationResponse,
  createUnavailableResult,
};
