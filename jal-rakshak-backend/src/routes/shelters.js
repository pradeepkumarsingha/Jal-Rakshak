const express = require('express');
const {
  getAllShelters,
  getNearbyShelters,
  getShelterById,
  createShelter,
  updateShelter,
  updateOccupancy,
  deleteShelter,
} = require('../controllers/shelterController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.get('/', optionalAuth, getAllShelters);
router.get('/nearby', optionalAuth, getNearbyShelters);
router.get('/:id', optionalAuth, getShelterById);
router.post('/', protect, authorize('admin'), createShelter);
router.put('/:id', protect, authorize('admin'), updateShelter);
router.patch('/:id/occupancy', protect, authorize('admin', 'rescue'), updateOccupancy);
router.delete('/:id', protect, authorize('admin'), deleteShelter);

module.exports = router;
