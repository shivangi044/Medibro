const MedicineLog = require('../models/MedicineLog');
const Medicine = require('../models/Medicine');
const User = require('../models/User');

/**
 * @desc    Get medicines to dispense (for hardware to fetch schedule)
 * @route   GET /api/hardware/schedule
 * @access  Public (Hardware should send botId for identification)
 */
const getHardwareSchedule = async (req, res, next) => {
  try {
    const { botId, startTime, endTime } = req.query;

    if (!botId) {
      res.status(400);
      return next(new Error('Bot ID is required'));
    }

    // Find user by connected bot ID
    const user = await User.findOne({ connectedBotId: botId });

    if (!user) {
      res.status(404);
      return next(new Error('Device not registered'));
    }

    // Default to next 24 hours if no time range provided
    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Get pending and snoozed logs within time range
    const logs = await MedicineLog.find({
      userId: user._id,
      scheduledTime: {
        $gte: start,
        $lte: end
      },
      status: { $in: ['pending', 'snoozed'] },
      syncedToHardware: false
    })
      .populate('medicineId', 'name dosage instructions')
      .sort({ scheduledTime: 1 });

    // Mark logs as synced to hardware
    const logIds = logs.map(log => log._id);
    await MedicineLog.updateMany(
      { _id: { $in: logIds } },
      { 
        syncedToHardware: true, 
        hardwareSyncTime: new Date() 
      }
    );

    // Format data for hardware
    const scheduleData = logs.map(log => ({
      logId: log._id,
      medicineName: log.medicineName,
      dosage: log.dosage,
      scheduledTime: log.scheduledTime,
      slot: log.slot,
      instructions: log.medicineId?.instructions || '',
      status: log.status
    }));

    res.json({
      success: true,
      botId,
      userId: user._id,
      scheduleCount: scheduleData.length,
      data: scheduleData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update medicine status from hardware
 * @route   POST /api/hardware/update-status
 * @access  Public (Hardware endpoint)
 */
const updateStatusFromHardware = async (req, res, next) => {
  try {
    const { botId, logId, status, timestamp } = req.body;

    if (!botId || !logId || !status) {
      res.status(400);
      return next(new Error('Bot ID, log ID, and status are required'));
    }

    // Verify bot is registered
    const user = await User.findOne({ connectedBotId: botId });
    if (!user) {
      res.status(404);
      return next(new Error('Device not registered'));
    }

    // Find the log
    const log = await MedicineLog.findOne({
      _id: logId,
      userId: user._id
    });

    if (!log) {
      res.status(404);
      return next(new Error('Medicine log not found'));
    }

    // Update status based on hardware input
    if (status === 'dispensed' || status === 'taken') {
      await log.markAsTaken();
      
      // Decrement medicine count
      const medicine = await Medicine.findById(log.medicineId);
      if (medicine) {
        await medicine.decrementRemaining();
      }
    } else if (status === 'skipped') {
      await log.markAsSkipped('Skipped from hardware device');
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        logId: log._id,
        status: log.status,
        takenTime: log.takenTime
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current slot configuration
 * @route   GET /api/hardware/slots
 * @access  Public (Hardware endpoint)
 */
const getSlotConfiguration = async (req, res, next) => {
  try {
    const { botId } = req.query;

    if (!botId) {
      res.status(400);
      return next(new Error('Bot ID is required'));
    }

    // Find user by bot ID
    const user = await User.findOne({ connectedBotId: botId });
    if (!user) {
      res.status(404);
      return next(new Error('Device not registered'));
    }

    // Get all active medicines with slot information
    const medicines = await Medicine.find({
      userId: user._id,
      isActive: true
    }).select('name dosage slot quantity remaining times');

    // Format slot configuration
    const slotConfig = medicines.map(med => ({
      slot: med.slot,
      medicineName: med.name,
      dosage: med.dosage,
      remaining: med.remaining,
      times: med.times
    }));

    res.json({
      success: true,
      botId,
      slotCount: slotConfig.length,
      data: slotConfig
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk update medicine statuses
 * @route   POST /api/hardware/bulk-update
 * @access  Public (Hardware endpoint)
 */
const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { botId, updates } = req.body;

    if (!botId || !Array.isArray(updates)) {
      res.status(400);
      return next(new Error('Bot ID and updates array are required'));
    }

    // Verify bot
    const user = await User.findOne({ connectedBotId: botId });
    if (!user) {
      res.status(404);
      return next(new Error('Device not registered'));
    }

    const results = [];

    for (const update of updates) {
      try {
        const log = await MedicineLog.findOne({
          _id: update.logId,
          userId: user._id
        });

        if (log) {
          if (update.status === 'taken' || update.status === 'dispensed') {
            await log.markAsTaken();
            
            const medicine = await Medicine.findById(log.medicineId);
            if (medicine) {
              await medicine.decrementRemaining();
            }
          } else if (update.status === 'skipped') {
            await log.markAsSkipped('Bulk update from hardware');
          }

          results.push({
            logId: update.logId,
            success: true,
            status: log.status
          });
        } else {
          results.push({
            logId: update.logId,
            success: false,
            error: 'Log not found'
          });
        }
      } catch (err) {
        results.push({
          logId: update.logId,
          success: false,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      totalUpdates: updates.length,
      successCount: results.filter(r => r.success).length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hardware health check and sync status
 * @route   GET /api/hardware/health
 * @access  Public
 */
const healthCheck = async (req, res, next) => {
  try {
    const { botId } = req.query;

    if (!botId) {
      return res.json({
        success: true,
        message: 'Hardware API is running',
        timestamp: new Date()
      });
    }

    // If botId provided, check registration status
    const user = await User.findOne({ connectedBotId: botId });

    res.json({
      success: true,
      message: 'Hardware API is running',
      botRegistered: !!user,
      botId: botId,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register or update hardware device
 * @route   POST /api/hardware/register
 * @access  Public
 */
const registerDevice = async (req, res, next) => {
  try {
    const { botId, userId } = req.body;

    if (!botId || !userId) {
      res.status(400);
      return next(new Error('Bot ID and User ID are required'));
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Update user with bot information
    user.connectedBotId = botId;
    user.bluetoothConnected = true;
    await user.save();

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: {
        botId: user.connectedBotId,
        userId: user._id,
        userName: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHardwareSchedule,
  updateStatusFromHardware,
  getSlotConfiguration,
  bulkUpdateStatus,
  healthCheck,
  registerDevice
};
