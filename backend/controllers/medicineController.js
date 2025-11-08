const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');

/**
 * @desc    Add a new medicine
 * @route   POST /api/medicines
 * @access  Private
 */
const addMedicine = async (req, res, next) => {
  try {
    const {
      name,
      dosage,
      times,
      frequency,
      slot,
      quantity,
      remaining,
      description,
      sideEffects,
      instructions,
      prescribedBy,
      startDate,
      endDate,
      category
    } = req.body;

    // Check if slot is already used by another medicine for this user
    const existingSlot = await Medicine.findOne({
      userId: req.user._id,
      slot: slot,
      isActive: true
    });

    if (existingSlot) {
      res.status(400);
      return next(new Error(`Slot ${slot} is already in use by ${existingSlot.name}`));
    }

    // Create medicine
    const medicine = await Medicine.create({
      userId: req.user._id,
      name,
      dosage,
      times,
      frequency,
      slot,
      quantity,
      remaining,
      description,
      sideEffects,
      instructions,
      prescribedBy,
      startDate,
      endDate,
      category
    });

    // Create medicine logs for the schedule
    await createMedicineLogs(medicine);

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all medicines for logged in user
 * @route   GET /api/medicines
 * @access  Private
 */
const getMedicines = async (req, res, next) => {
  try {
    const { isActive, category } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (category) {
      filter.category = category;
    }

    const medicines = await Medicine.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single medicine by ID
 * @route   GET /api/medicines/:id
 * @access  Private
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medicine) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update medicine
 * @route   PUT /api/medicines/:id
 * @access  Private
 */
const updateMedicine = async (req, res, next) => {
  try {
    let medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medicine) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    // If slot is being changed, check if new slot is available
    if (req.body.slot && req.body.slot !== medicine.slot) {
      const existingSlot = await Medicine.findOne({
        userId: req.user._id,
        slot: req.body.slot,
        isActive: true,
        _id: { $ne: medicine._id }
      });

      if (existingSlot) {
        res.status(400);
        return next(new Error(`Slot ${req.body.slot} is already in use`));
      }
    }

    // Update medicine
    medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete medicine (soft delete by setting isActive to false)
 * @route   DELETE /api/medicines/:id
 * @access  Private
 */
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!medicine) {
      res.status(404);
      return next(new Error('Medicine not found'));
    }

    medicine.isActive = false;
    await medicine.save();

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock medicines
 * @route   GET /api/medicines/alerts/low-stock
 * @access  Private
 */
const getLowStockMedicines = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 7;

    const lowStockMedicines = await Medicine.find({
      userId: req.user._id,
      isActive: true,
      remaining: { $lte: threshold }
    }).sort({ remaining: 1 });

    res.json({
      success: true,
      count: lowStockMedicines.length,
      data: lowStockMedicines
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to create medicine logs for schedule
 */
async function createMedicineLogs(medicine) {
  const logs = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create logs for the next 7 days
  for (let day = 0; day < 7; day++) {
    for (const time of medicine.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setDate(today.getDate() + day);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Only create logs for future times
      if (scheduledTime > new Date()) {
        logs.push({
          userId: medicine.userId,
          medicineId: medicine._id,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          scheduledTime,
          status: 'pending',
          slot: medicine.slot
        });
      }
    }
  }

  if (logs.length > 0) {
    await MedicineLog.insertMany(logs);
  }
}

module.exports = {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines
};
