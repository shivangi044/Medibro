const express = require('express');
const router = express.Router();
const {
  getAdherenceStats,
  getAIInsights,
  getPatternAnalysis
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

// Analytics routes
router.get('/adherence', getAdherenceStats);
router.get('/insights', getAIInsights);
router.get('/patterns', getPatternAnalysis);

module.exports = router;
