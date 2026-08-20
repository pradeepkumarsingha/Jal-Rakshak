const express = require('express');
const {
  getRiskMap,
  getSheltersGis,
  calculateSafeRoute,
  getLiveReportsGis,
  getLiveEmergenciesGis,
  getRescueUnitsGis,
} = require('../controllers/gisController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/risk-map', optionalAuth, getRiskMap);
router.get('/shelters', optionalAuth, getSheltersGis);
router.post('/safe-route', optionalAuth, calculateSafeRoute);
router.get('/reports', optionalAuth, getLiveReportsGis);
router.get('/emergencies', optionalAuth, getLiveEmergenciesGis);
router.get('/rescue-units', protect, authorize('admin', 'rescue'), getRescueUnitsGis);

module.exports = router;
