const express = require('express');
const router = express.Router();
const {
  getHardwareSchedule,
  updateStatusFromHardware,
  getSlotConfiguration,
  bulkUpdateStatus,
  healthCheck,
  registerDevice
} = require('../controllers/hardwareController');

/**
 * Hardware API Routes
 * These endpoints are designed to be called by the hardware device
 * They use botId for authentication instead of JWT tokens
 */

// Health check - no authentication required
router.get('/health', healthCheck);

// Device registration
router.post('/register', registerDevice);

// Get schedule for hardware to dispense medicines
router.get('/schedule', getHardwareSchedule);

// Get slot configuration
router.get('/slots', getSlotConfiguration);

// Update single medicine status from hardware
router.post('/update-status', updateStatusFromHardware);

// Bulk update medicine statuses
router.post('/bulk-update', bulkUpdateStatus);

module.exports = router;
