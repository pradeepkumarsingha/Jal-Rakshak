const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const isPlaceholderConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  return (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    cloudName.includes('demo') ||
    cloudName.includes('your_cloudinary') ||
    apiKey.includes('123456') ||
    apiKey.includes('your_') ||
    apiSecret.includes('abcdef') ||
    apiSecret.includes('your_')
  );
};

const saveImageLocally = (buffer) => {
  try {
    const uploadsDir = path.resolve(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `report_dev_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${filename}`;
  } catch (err) {
    logger.error(`Failed to save image locally: ${err.message}`);
    const base64 = buffer ? buffer.toString('base64') : '';
    return `data:image/jpeg;base64,${base64}`;
  }
};

/**
 * Upload image buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - In-memory image buffer
 * @param {Object} options - Custom upload options (folder, etc.)
 * @returns {Promise<Object>} Formatted image metadata
 */
const uploadImageBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // If placeholder credentials are used in development, use local fallback
    if (isPlaceholderConfig() && process.env.NODE_ENV !== 'production') {
      logger.warn(
        'Cloudinary placeholder credentials detected in .env. Using mock Cloudinary storage adapter for local testing.'
      );
      const mockId = `jal-rakshak/reports/report_dev_${Date.now()}`;
      const localUrl = saveImageLocally(buffer);

      return resolve({
        secureUrl: localUrl,
        publicId: mockId,
        width: 1280,
        height: 720,
        format: 'jpg',
        bytes: buffer ? buffer.length : 124000,
        isMockStorage: true,
      });
    }

    const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'jal-rakshak/reports';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1920, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload error: ${error.message || 'Unknown upload error'}`);

          // Graceful fallback for invalid signature during dev
          if (
            (error.message && error.message.includes('Invalid Signature')) ||
            error.http_code === 401 ||
            error.http_code === 400
          ) {
            logger.warn('Cloudinary signature failed (invalid credentials). Providing development fallback URL.');
            const mockId = `jal-rakshak/reports/report_fallback_${Date.now()}`;
            const localUrl = saveImageLocally(buffer);
            return resolve({
              secureUrl: localUrl,
              publicId: mockId,
              width: 1280,
              height: 720,
              format: 'jpg',
              bytes: buffer ? buffer.length : 124000,
              isMockStorage: true,
            });
          }

          return reject(error);
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary by public ID
 * @param {string} publicId - Cloudinary asset public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  if (!publicId || publicId.includes('report_dev_') || publicId.includes('report_fallback_')) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    logger.info(`Cloudinary image deleted: ${publicId}`);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete failed for ${publicId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadImageBuffer,
  deleteImage,
};
