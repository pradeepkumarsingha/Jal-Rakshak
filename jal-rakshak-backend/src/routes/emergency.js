const express = require('express');
const {
  createEmergencyRequest,
  getMyEmergencies,
  getAllRequests,
  getRequestById,
  assignTeam,
  updateStatus,
  addNote,
} = require('../controllers/emergencyController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.post('/request', optionalAuth, createEmergencyRequest);
router.get('/my', protect, authorize('citizen'), getMyEmergencies);
router.get('/requests', optionalAuth, getAllRequests);
router.get('/:id', optionalAuth, getRequestById);

// Admin & Rescue Operations
router.post('/:id/assign', protect, authorize('admin'), assignTeam);
router.patch('/:id/status', protect, authorize('rescue', 'admin'), updateStatus);
router.post('/:id/notes', protect, authorize('admin', 'rescue'), addNote);

module.exports = router;
