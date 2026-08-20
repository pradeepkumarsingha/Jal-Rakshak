const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const logger = require('../utils/logger');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

// Configure Multer Cloudinary storage
let storage;

try {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== '123456789012345'
  ) {
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'jal_rakshak_reports',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
    });
  } else {
    // Memory storage fallback for local/test environments
    storage = multer.memoryStorage();
  }
} catch (err) {
  logger.warn(`Cloudinary storage init error: ${err.message}. Falling back to memory storage.`);
  storage = multer.memoryStorage();
}

module.exports = {
  cloudinary,
  storage,
};
