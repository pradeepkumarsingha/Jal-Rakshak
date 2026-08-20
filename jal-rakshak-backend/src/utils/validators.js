/**
 * Validate email address
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate Indian phone number (10 digits with optional +91 or leading 0)
 */
const isValidPhone = (phone) => {
  if (!phone) return true; // optional in some cases
  const cleanPhone = phone.replace(/[\s\-+]/g, '');
  return /^[0-9]{10,12}$/.test(cleanPhone);
};

/**
 * Validate Latitude (-90 to 90) and Longitude (-180 to 180)
 */
const isValidCoordinates = (lat, lng) => {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidCoordinates,
};
