const multer = require('multer');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error(
        'Only JPEG, PNG, and WEBP image files are allowed.'
      );
      error.statusCode = 415;
      error.code = 'UNSUPPORTED_IMAGE_TYPE';
      return cb(error);
    }
    cb(null, true);
  },
});

module.exports = {
  uploadSingleReportImage: upload.single('image'),
  uploadSingleImage: upload.single('image'),
  uploadMultipleImages: upload.array('images', 5),
  upload,
};
