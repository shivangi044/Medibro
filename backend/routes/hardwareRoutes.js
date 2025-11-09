const express = require('express');
const router = express.Router();
const {
  getUpcomingMedicines,
  getTakenMedicines,
  getMissedMedicines,
  receiveUpcomingUpdate,
  receiveTakenUpdate,
  receiveMissedUpdate,
  healthCheck
} = require('../controllers/hardwareController');

/**
 * Hardware API Routes
 * No authentication needed - uses mock data for testing
 * No MongoDB connection required
 * 
 * Each endpoint has:
 * - GET: Backend sends data to hardware/mobile app
 * - POST: Hardware sends status updates to backend
 */

// Health check - API status
router.get('/health', healthCheck);

// ============================================
// UPCOMING MEDICINES
// ============================================
// GET: Backend sends upcoming medicines to hardware
router.get('/upcoming', getUpcomingMedicines);

// POST: Hardware sends status update (taken/snoozed/missed)
router.post('/upcoming', receiveUpcomingUpdate);

// ============================================
// TAKEN MEDICINES
// ============================================
// GET: Backend sends taken medicines to mobile app
router.get('/taken', getTakenMedicines);

// POST: Hardware confirms medicine was taken or snoozed
router.post('/taken', receiveTakenUpdate);

// ============================================
// MISSED MEDICINES
// ============================================
// GET: Backend sends missed medicines to mobile app
router.get('/missed', getMissedMedicines);

// POST: Hardware confirms medicine was missed
router.post('/missed', receiveMissedUpdate);

module.exports = router;
