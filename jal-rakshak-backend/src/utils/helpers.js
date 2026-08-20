/**
 * Standard Success Response Formatter
 */
const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

/**
 * Standard Error Response Formatter
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    error: message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

/**
 * Standard Paginated Response Formatter
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

/**
 * Convert lat/lng to GeoJSON Point
 */
const toGeoJSONPoint = (lng, lat) => {
  if (lng === undefined || lat === undefined || lng === null || lat === null) {
    return undefined;
  }
  return {
    type: 'Point',
    coordinates: [Number(lng), Number(lat)],
  };
};

/**
 * Parse coordinates from GeoJSON or object
 */
const parseCoordinates = (loc) => {
  if (!loc) return { lat: null, lng: null };
  if (loc.coordinates && Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
    return { lng: loc.coordinates[0], lat: loc.coordinates[1] };
  }
  if (loc.lat !== undefined && loc.lng !== undefined) {
    return { lat: Number(loc.lat), lng: Number(loc.lng) };
  }
  if (loc.latitude !== undefined && loc.longitude !== undefined) {
    return { lat: Number(loc.latitude), lng: Number(loc.longitude) };
  }
  return { lat: null, lng: null };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  toGeoJSONPoint,
  parseCoordinates,
};
