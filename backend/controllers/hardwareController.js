const HardwareMedicine = require('../models/HardwareMedicine');

/**
 * @desc    Get upcoming medicines (pending status)
 * @route   GET /api/hardware/upcoming
 * @access  Public (No authentication needed)
 */
const getUpcomingMedicines = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = await HardwareMedicine.find({
      status: 'pending',
      date: today
    }).sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming.map(med => ({
        id: med._id.toString(),
        medicineName: med.medicineName,
        dosage: med.dosage,
        slot: med.slot,
        scheduledTime: med.scheduledTime,
        status: med.status,
        snoozeCount: med.snoozeCount || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get taken medicines
 * @route   GET /api/hardware/taken
 * @access  Public (No authentication needed)
 */
const getTakenMedicines = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const taken = await HardwareMedicine.find({
      status: 'taken',
      date: today
    }).sort({ takenTime: -1 });

    res.status(200).json({
      success: true,
      count: taken.length,
      data: taken.map(med => ({
        id: med._id.toString(),
        medicineName: med.medicineName,
        dosage: med.dosage,
        slot: med.slot,
        scheduledTime: med.scheduledTime,
        takenTime: med.takenTime,
        status: med.status,
        snoozeCount: med.snoozeCount || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get missed medicines (includes both missed and snoozed)
 * @route   GET /api/hardware/missed
 * @access  Public (No authentication needed)
 */
const getMissedMedicines = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const missed = await HardwareMedicine.find({
      status: { $in: ['missed', 'snoozed'] },
      date: today
    }).sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      count: missed.length,
      data: missed.map(med => ({
        id: med._id.toString(),
        medicineName: med.medicineName,
        dosage: med.dosage,
        slot: med.slot,
        scheduledTime: med.scheduledTime,
        status: med.status,
        snoozeCount: med.snoozeCount || 0,
        ...(med.status === 'snoozed' && { snoozedUntil: med.snoozedUntil })
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Receive data from hardware about upcoming medicines (POST)
 * @route   POST /api/hardware/upcoming
 * @access  Public (No authentication needed)
 * @body    { id, status, snoozeCount } - Hardware sends which medicine was dispensed/removed from upcoming
 */
const receiveUpcomingUpdate = async (req, res, next) => {
  try {
    const { id, status, snoozeCount } = req.body;

    if (!id || !status) {
      res.status(400);
      return next(new Error('Medicine ID and status are required'));
    }

    console.log(`📥 Received from hardware - Upcoming medicine update: ID=${id}, Status=${status}, SnoozeCount=${snoozeCount || 0}`);

    // Find medicine in MongoDB
    const medicine = await HardwareMedicine.findById(id);
    
    if (!medicine) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    // Logic: Medicine removed from upcoming
    if (status === 'taken') {
      medicine.status = 'taken';
      medicine.takenTime = new Date();
      medicine.snoozeCount = 0;
      console.log(`✅ Medicine "${medicine.medicineName}" moved to TAKEN`);
    } 
    else if (status === 'snoozed') {
      // Use snoozeCount from hardware if provided, otherwise increment backend count
      if (snoozeCount !== undefined) {
        medicine.snoozeCount = snoozeCount;
        console.log(`⏰ Hardware sent snoozeCount: ${snoozeCount}`);
      } else {
        medicine.snoozeCount = (medicine.snoozeCount || 0) + 1;
        console.log(`⏰ Backend incremented snoozeCount: ${medicine.snoozeCount}`);
      }
      
      // If snoozed more than 2 times, move to missed
      if (medicine.snoozeCount > 2) {
        medicine.status = 'missed';
        console.log(`❌ Medicine "${medicine.medicineName}" snoozed ${medicine.snoozeCount} times - moved to MISSED`);
      } else {
        medicine.status = 'snoozed';
        medicine.snoozedUntil = new Date(Date.now() + 30 * 60 * 1000);
        console.log(`⏰ Medicine "${medicine.medicineName}" snoozed (count: ${medicine.snoozeCount})`);
      }
    }
    else if (status === 'missed') {
      medicine.status = 'missed';
      console.log(`❌ Medicine "${medicine.medicineName}" moved to MISSED`);
    }

    // Save to MongoDB
    await medicine.save();

    res.status(200).json({
      success: true,
      message: 'Upcoming medicine status received successfully',
      data: {
        id: medicine._id.toString(),
        medicineName: medicine.medicineName,
        status: medicine.status,
        snoozeCount: medicine.snoozeCount,
        movedTo: medicine.status === 'missed' ? 'missed dataset' : 
                 medicine.status === 'taken' ? 'taken dataset' : 'upcoming dataset'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Receive data from hardware about taken medicines (POST)
 * @route   POST /api/hardware/taken
 * @access  Public (No authentication needed)
 * @body    { id, status } - Hardware confirms medicine was taken or snoozed
 */
const receiveTakenUpdate = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      res.status(400);
      return next(new Error('Medicine ID and status are required'));
    }

    console.log(`📥 Received from hardware - Taken medicine update: ID=${id}, Status=${status}`);

    // Find medicine in MongoDB
    const medicine = await HardwareMedicine.findById(id);
    
    if (!medicine) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    // Logic: Medicine marked as taken or snoozed
    if (status === 'taken') {
      medicine.status = 'taken';
      medicine.takenTime = new Date();
      medicine.snoozeCount = 0;
      console.log(`✅ Medicine "${medicine.medicineName}" confirmed as TAKEN`);
    } 
    else if (status === 'snoozed') {
      medicine.snoozeCount = (medicine.snoozeCount || 0) + 1;
      
      // If snoozed more than 2 times, move to missed
      if (medicine.snoozeCount > 2) {
        medicine.status = 'missed';
        console.log(`❌ Medicine "${medicine.medicineName}" snoozed ${medicine.snoozeCount} times - moved to MISSED`);
      } else {
        medicine.status = 'snoozed';
        medicine.snoozedUntil = new Date(Date.now() + 30 * 60 * 1000);
        console.log(`⏰ Medicine "${medicine.medicineName}" snoozed again (count: ${medicine.snoozeCount})`);
      }
    }

    // Save to MongoDB
    await medicine.save();

    res.status(200).json({
      success: true,
      message: 'Taken medicine status received successfully',
      data: {
        id: medicine._id.toString(),
        medicineName: medicine.medicineName,
        status: medicine.status,
        snoozeCount: medicine.snoozeCount,
        takenTime: medicine.takenTime,
        movedTo: medicine.status === 'missed' ? 'missed dataset' : 'taken dataset'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Receive data from hardware about missed medicines (POST)
 * @route   POST /api/hardware/missed
 * @access  Public (No authentication needed)
 * @body    { id, status } - Hardware confirms medicine was missed
 */
const receiveMissedUpdate = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      res.status(400);
      return next(new Error('Medicine ID is required'));
    }

    console.log(`📥 Received from hardware - Missed medicine update: ID=${id}, Status=${status || 'missed'}`);

    // Find medicine in MongoDB
    const medicine = await HardwareMedicine.findById(id);
    
    if (!medicine) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    // Logic: Medicine confirmed as missed
    medicine.status = 'missed';
    console.log(`❌ Medicine "${medicine.medicineName}" confirmed as MISSED`);

    // Save to MongoDB
    await medicine.save();

    res.status(200).json({
      success: true,
      message: 'Missed medicine status received successfully',
      data: {
        id: medicine._id.toString(),
        medicineName: medicine.medicineName,
        status: medicine.status,
        movedTo: 'missed dataset'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Health check for hardware
 * @route   GET /api/hardware/health
 * @access  Public (No authentication needed)
 */
const healthCheck = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Hardware API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        upcoming: 'GET /api/hardware/upcoming',
        taken: 'GET /api/hardware/taken',
        missed: 'GET /api/hardware/missed',
        updateStatus: 'POST /api/hardware/update-status'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUpcomingMedicines,
  getTakenMedicines,
  getMissedMedicines,
  receiveUpcomingUpdate,
  receiveTakenUpdate,
  receiveMissedUpdate,
  healthCheck
};
