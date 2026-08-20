const express = require('express');
const {
  getDashboardStats,
  getAnalytics,
  getPendingReports,
  getAuditLogs,
  getUsers,
  broadcastAlert,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/reports/pending', getPendingReports);
router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.post('/alerts/broadcast', broadcastAlert);

module.exports = router;
