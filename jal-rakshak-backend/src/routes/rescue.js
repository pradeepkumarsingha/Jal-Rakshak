const express = require('express');
const {
  getTeams,
  createTeam,
  updateTeamStatus,
  updateTeamLocation,
  getAssignments,
} = require('../controllers/rescueController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/teams', protect, authorize('admin', 'rescue'), getTeams);
router.post('/teams', protect, authorize('admin'), createTeam);
router.patch('/teams/:id/status', protect, authorize('admin', 'rescue'), updateTeamStatus);
router.patch('/teams/:id/location', protect, authorize('rescue'), updateTeamLocation);
router.get('/assignments', protect, authorize('rescue', 'admin'), getAssignments);

module.exports = router;
