const express = require('express');
const {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  verifyReport,
  analyzeImage,
  deleteReport,
} = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { uploadSingleImage } = require('../middleware/upload');

const router = express.Router();

router.get('/', optionalAuth, getAllReports);
router.post('/', optionalAuth, uploadSingleImage, createReport);
router.get('/my', protect, authorize('citizen'), getMyReports);
router.post('/analyze-image', uploadSingleImage, analyzeImage);
router.get('/:id', optionalAuth, getReportById);

// Admin / Rescue verification & management
router.post('/:id/verify', protect, authorize('admin', 'rescue'), verifyReport);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
