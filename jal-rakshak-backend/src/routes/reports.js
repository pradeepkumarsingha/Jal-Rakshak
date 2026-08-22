const express = require('express');
const {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  verifyReport,
  assignRescueTeamToReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { uploadSingleReportImage } = require('../middleware/upload');

const router = express.Router();

router.get('/', optionalAuth, getAllReports);
router.post('/', optionalAuth, uploadSingleReportImage, createReport);
router.get('/my', protect, getMyReports);
router.get('/:id', optionalAuth, getReportById);

// Admin verification, tactical rescue assignment & deletion
router.post('/:id/verify', protect, authorize('admin'), verifyReport);
router.post('/:id/assign-rescue', protect, authorize('admin'), assignRescueTeamToReport);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
