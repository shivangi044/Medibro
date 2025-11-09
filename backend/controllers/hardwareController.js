// Mock data for hardware testing (no MongoDB required)
const mockMedicines = [
  {
    id: '1',
    medicineName: 'Aspirin',
    dosage: '100mg',
    slot: 1,
    scheduledTime: '08:00',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: '2',
    medicineName: 'Vitamin D',
    dosage: '50mg',
    slot: 2,
    scheduledTime: '14:00',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: '3',
    medicineName: 'Calcium',
    dosage: '500mg',
    slot: 3,
    scheduledTime: '20:00',
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: '4',
    medicineName: 'Paracetamol',
    dosage: '500mg',
    slot: 4,
    scheduledTime: '06:00',
    status: 'taken',
    takenTime: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: '5',
    medicineName: 'Ibuprofen',
    dosage: '200mg',
    slot: 1,
    scheduledTime: '10:00',
    status: 'missed',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: '6',
    medicineName: 'Antibiotic',
    dosage: '250mg',
    slot: 2,
    scheduledTime: '12:00',
    status: 'snoozed',
    snoozedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    date: new Date().toISOString().split('T')[0]
  }
];

// In-memory storage for medicine status updates
let medicineStorage = [...mockMedicines];

/**
 * @desc    Get upcoming medicines (pending status)
 * @route   GET /api/hardware/upcoming
 * @access  Public (No authentication needed)
 */
const getUpcomingMedicines = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const upcoming = medicineStorage.filter(med => 
      med.status === 'pending' && med.date === today
    );

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming.map(med => ({
        id: med.id,
        medicineName: med.medicineName,
        dosage: med.dosage,
        slot: med.slot,
        scheduledTime: med.scheduledTime,
        status: med.status
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
    
    const taken = medicineStorage.filter(med => 
      med.status === 'taken' && med.date === today
    );

    res.status(200).json({
      success: true,
      count: taken.length,
      data: taken.map(med => ({
        id: med.id,
        medicineName: med.medicineName,
        dosage: med.dosage,
        slot: med.slot,
        scheduledTime: med.scheduledTime,
        takenTime: med.takenTime,
        status: med.status
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
    
    const missed = medicineStorage.filter(med => 
      (med.status === 'missed' || med.status === 'snoozed') && med.date === today
    );

    res.status(200).json({
      success: true,
      count: missed.length,
      data: missed.map(med => ({
        id: med.id,
        medicineName: med.medicineName,
        dosage: med.dosage,
        slot: med.slot,
        scheduledTime: med.scheduledTime,
        status: med.status,
        ...(med.status === 'snoozed' && { snoozedUntil: med.snoozedUntil })
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update medicine status from hardware
 * @route   POST /api/hardware/update-status
 * @access  Public (No authentication needed)
 */
const updateStatusFromHardware = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      res.status(400);
      return next(new Error('Medicine ID and status are required'));
    }

    // Validate status
    const validStatuses = ['pending', 'taken', 'missed', 'snoozed', 'skipped'];
    if (!validStatuses.includes(status)) {
      res.status(400);
      return next(new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`));
    }

    // Find medicine in storage
    const medicineIndex = medicineStorage.findIndex(med => med.id === id);
    
    if (medicineIndex === -1) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    // Update status
    medicineStorage[medicineIndex].status = status;
    
    if (status === 'taken') {
      medicineStorage[medicineIndex].takenTime = new Date().toISOString();
    }
    
    if (status === 'snoozed') {
      medicineStorage[medicineIndex].snoozedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    }

    res.status(200).json({
      success: true,
      message: 'Medicine status updated successfully',
      data: medicineStorage[medicineIndex]
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
  updateStatusFromHardware,
  healthCheck
};
