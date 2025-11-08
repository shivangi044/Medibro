const MedicineLog = require('../models/MedicineLog');
const Medicine = require('../models/Medicine');

/**
 * @desc    Get medicine logs (schedule) for a specific date range
 * @route   GET /api/logs
 * @access  Private
 */
const getLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;

    const filter = { userId: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      filter.scheduledTime = {};
      if (startDate) {
        filter.scheduledTime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.scheduledTime.$lte = new Date(endDate);
      }
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    const logs = await MedicineLog.find(filter)
      .populate('medicineId', 'name dosage instructions')
      .sort({ scheduledTime: 1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's medicine schedule
 * @route   GET /api/logs/today
 * @access  Private
 */
const getTodaySchedule = async (req, res, next) => {
  try {
    const todayLogs = await MedicineLog.getTodaySchedule(req.user._id);

    res.json({
      success: true,
      count: todayLogs.length,
      data: todayLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pending medicines (not taken yet)
 * @route   GET /api/logs/pending
 * @access  Private
 */
const getPendingLogs = async (req, res, next) => {
  try {
    const now = new Date();
    
    const pendingLogs = await MedicineLog.find({
      userId: req.user._id,
      status: 'pending',
      scheduledTime: { $lte: now } // Medicines that should have been taken by now
    })
      .populate('medicineId', 'name dosage instructions')
      .sort({ scheduledTime: 1 });

    res.json({
      success: true,
      count: pendingLogs.length,
      data: pendingLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update medicine log status (Mark as taken/snoozed/skipped)
 * @route   PUT /api/logs/:id/status
 * @access  Private
 */
const updateLogStatus = async (req, res, next) => {
  try {
    const { status, notes, snoozeMinutes } = req.body;

    let log = await MedicineLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      res.status(404);
      return next(new Error('Medicine log not found'));
    }

    // Update based on status
    if (status === 'taken') {
      await log.markAsTaken();
      
      // Decrement medicine remaining count
      const medicine = await Medicine.findById(log.medicineId);
      if (medicine) {
        await medicine.decrementRemaining();
      }
    } else if (status === 'snoozed') {
      await log.markAsSnoozed(snoozeMinutes || 15);
    } else if (status === 'skipped') {
      await log.markAsSkipped(notes);
    }

    // Reload log to get updated data
    log = await MedicineLog.findById(log._id).populate('medicineId', 'name dosage');

    res.json({
      success: true,
      message: `Medicine marked as ${status}`,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medicine log by ID
 * @route   GET /api/logs/:id
 * @access  Private
 */
const getLogById = async (req, res, next) => {
  try {
    const log = await MedicineLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('medicineId', 'name dosage instructions sideEffects');

    if (!log) {
      res.status(404);
      return next(new Error('Medicine log not found'));
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medicine history for analytics
 * @route   GET /api/logs/history/:medicineId
 * @access  Private
 */
const getMedicineHistory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {
      userId: req.user._id,
      medicineId: req.params.medicineId
    };

    if (startDate || endDate) {
      filter.scheduledTime = {};
      if (startDate) {
        filter.scheduledTime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.scheduledTime.$lte = new Date(endDate);
      }
    }

    const history = await MedicineLog.find(filter)
      .sort({ scheduledTime: -1 })
      .limit(100);

    // Calculate statistics
    const stats = {
      total: history.length,
      taken: history.filter(log => log.status === 'taken' || log.status === 'taken_late').length,
      skipped: history.filter(log => log.status === 'skipped').length,
      snoozed: history.filter(log => log.status === 'snoozed').length,
      pending: history.filter(log => log.status === 'pending').length
    };

    stats.adherenceRate = stats.total > 0 
      ? Math.round((stats.taken / stats.total) * 100) 
      : 0;

    res.json({
      success: true,
      stats,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLogs,
  getTodaySchedule,
  getPendingLogs,
  updateLogStatus,
  getLogById,
  getMedicineHistory
};
