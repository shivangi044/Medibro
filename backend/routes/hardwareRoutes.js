const express = require('express');
const router = express.Router();
const {
  getUpcomingMedicines,
  getTakenMedicines,
  getMissedMedicines,
  updateStatusFromHardware,
  healthCheck
} = require('../controllers/hardwareController');

/**
 * Hardware API Routes
 * No authentication needed - uses mock data for testing
 * No MongoDB connection required
 */

// Health check - API status
router.get('/health', healthCheck);

// Get upcoming medicines (pending status)
router.get('/upcoming', getUpcomingMedicines);

// Get taken medicines (completed)
router.get('/taken', getTakenMedicines);

// Get missed medicines (includes both missed and snoozed)
router.get('/missed', getMissedMedicines);

// Update medicine status from hardware (POST)
router.post('/update-status', updateStatusFromHardware);

module.exports = router;
