const express = require('express');
const authRoutes = require('./auth');
const floodRoutes = require('./flood');
const gisRoutes = require('./gis');
const shelterRoutes = require('./shelters');
const reportRoutes = require('./reports');
const emergencyRoutes = require('./emergency');
const rescueRoutes = require('./rescue');
const assistantRoutes = require('./assistant');
const alertRoutes = require('./alerts');
const adminRoutes = require('./admin');
const dashboardRoutes = require('./dashboard');

const { chat } = require('../controllers/assistantController');
const { analyzeImage } = require('../controllers/reportController');
const { uploadSingleImage } = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mount standard API v1 routes
router.use('/v1/auth', authRoutes);
router.use('/v1/flood', floodRoutes);
router.use('/v1/dashboard', dashboardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/v1/gis', gisRoutes);
router.use('/v1/shelters', shelterRoutes);
router.use('/v1/reports', reportRoutes);
router.use('/v1/emergency', emergencyRoutes);
router.use('/v1/rescue', rescueRoutes);
router.use('/v1/assistant', assistantRoutes);
router.use('/v1/alerts', alertRoutes);
router.use('/v1/admin', adminRoutes);

// Direct aliases for seamless compatibility
router.post('/v1/images/analyze', uploadSingleImage, analyzeImage);
router.post('/chat', optionalAuth, chat);

// Health check endpoints (/api/v1/health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jal Rakshak Disaster Intelligence API is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '2.0.0',
  });
};

router.get('/v1/health', healthHandler);
router.get('/health', healthHandler);

// Unified System Health Check (/api/v1/system/health)
router.get(['/v1/system/health', '/system/health'], async (req, res) => {
  const { aiService } = require('../services');
  let aiHealth = { status: 'unavailable', service: 'jal-rakshak-ai' };
  try {
    const aiData = await aiService.health();
    aiHealth = aiData || { status: 'healthy', service: 'jal-rakshak-ai' };
  } catch (err) {
    aiHealth = { status: 'unavailable', service: 'jal-rakshak-ai', error: err.message };
  }

  res.status(200).json({
    success: true,
    data: {
      express: {
        status: 'healthy',
        service: 'jal-rakshak-express-backend',
      },
      aiService: aiHealth,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
