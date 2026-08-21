const express = require('express');
const { getLocationDashboard } = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Unified Location Dashboard (Public/Citizen accessible with optional JWT enrichment)
router.get('/location', optionalAuth, getLocationDashboard);

module.exports = router;
