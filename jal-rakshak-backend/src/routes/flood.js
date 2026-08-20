const express = require('express');
const {
  predictFlood,
  getForecast,
  getHistory,
  getRiskByLocation,
  getRiversTelemetry,
} = require('../controllers/floodController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/predict', optionalAuth, predictFlood);
router.get('/forecast', optionalAuth, getForecast);
router.get('/history', optionalAuth, getHistory);
router.get('/risk/:location', getRiskByLocation);
router.get('/rivers', getRiversTelemetry);

module.exports = router;
