const express = require('express');
const {
  getTeams,
  createTeam,
  getAssignments,
  getAssignmentById,
  updateAssignmentStatus,
  updateTeamStatus,
  updateTeamLocation,
} = require('../controllers/rescueController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Rescue Teams
router.get('/teams', protect, authorize('admin', 'rescue'), getTeams);
router.post('/teams', protect, authorize('admin'), createTeam);
router.patch('/teams/:id/status', protect, authorize('admin', 'rescue'), updateTeamStatus);
router.patch('/teams/:id/location', protect, authorize('rescue'), updateTeamLocation);

// Rescue Assignments
router.get('/assignments', protect, authorize('rescue', 'admin'), getAssignments);
router.get('/assignments/:id', protect, authorize('rescue', 'admin'), getAssignmentById);
router.patch('/assignments/:assignmentId/status', protect, authorize('rescue', 'admin'), updateAssignmentStatus);

module.exports = router;
