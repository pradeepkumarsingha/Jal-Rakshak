const express = require('express');
const { getActiveAlerts, getAlertById, broadcastAlert } = require('../controllers/alertController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', optionalAuth, getActiveAlerts);
router.get('/:id', optionalAuth, getAlertById);
router.post('/broadcast', protect, authorize('admin'), broadcastAlert);

module.exports = router;
