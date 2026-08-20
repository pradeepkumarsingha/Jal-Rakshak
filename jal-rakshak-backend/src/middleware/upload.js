const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { ErrorResponse } = require('./errorHandler');

// File filter for image uploads
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Please upload only image files (JPEG, PNG, WebP).', 400), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  fileFilter: imageFilter,
});

module.exports = {
  uploadSingleImage: upload.single('image'),
  uploadMultipleImages: upload.array('images', 5),
  upload,
};
