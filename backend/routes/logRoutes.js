const express = require('express');
const router = express.Router();
const {
  getLogs,
  getTodaySchedule,
  getPendingLogs,
  updateLogStatus,
  getLogById,
  getMedicineHistory
} = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const {
  updateLogStatusValidation,
  validate,
  objectIdValidation
} = require('../middleware/validator');

// All routes are protected (require authentication)
router.use(protect);

// Schedule routes
router.get('/', getLogs);
router.get('/today', getTodaySchedule);
router.get('/pending', getPendingLogs);

// Individual log routes
router.get('/:id', objectIdValidation('id'), validate, getLogById);
router.put('/:id/status', objectIdValidation('id'), updateLogStatusValidation, validate, updateLogStatus);

// History routes
router.get('/history/:medicineId', objectIdValidation('medicineId'), validate, getMedicineHistory);

module.exports = router;
