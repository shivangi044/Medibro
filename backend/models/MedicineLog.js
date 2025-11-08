const mongoose = require('mongoose');

/**
 * MedicineLog Schema
 * Tracks medicine intake history and status updates
 * This is the main data that will be sent to/from hardware
 */
const medicineLogSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Medicine ID is required'],
    index: true
  },

  // Medicine details (denormalized for hardware API)
  medicineName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },

  // Schedule information
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    index: true
  },
  
  // Actual taken time (null if not taken)
  takenTime: {
    type: Date,
    default: null
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'taken', 'snoozed', 'skipped', 'taken_late'],
    default: 'pending',
    required: true,
    index: true
  },

  // Hardware information
  slot: {
    type: String,
    required: [true, 'Hardware slot is required']
  },

  // Additional information
  notes: {
    type: String,
    default: ''
  },

  // Snooze information
  snoozedUntil: {
    type: Date,
    default: null
  },
  snoozeCount: {
    type: Number,
    default: 0
  },

  // Adherence tracking
  isOnTime: {
    type: Boolean,
    default: null // null means not applicable (e.g., for pending status)
  },
  delayMinutes: {
    type: Number,
    default: 0 // How many minutes late the medicine was taken
  },

  // Hardware sync
  syncedToHardware: {
    type: Boolean,
    default: false
  },
  hardwareSyncTime: {
    type: Date,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
medicineLogSchema.index({ userId: 1, scheduledTime: -1 });
medicineLogSchema.index({ userId: 1, status: 1 });
medicineLogSchema.index({ scheduledTime: 1, status: 1 });
medicineLogSchema.index({ syncedToHardware: 1 });

// Method to mark medicine as taken
medicineLogSchema.methods.markAsTaken = async function() {
  this.status = 'taken';
  this.takenTime = new Date();
  
  // Calculate if taken on time (within 30 minutes of scheduled time)
  const diffMinutes = (this.takenTime - this.scheduledTime) / (1000 * 60);
  this.isOnTime = Math.abs(diffMinutes) <= 30;
  this.delayMinutes = Math.max(0, diffMinutes);
  
  if (diffMinutes > 30) {
    this.status = 'taken_late';
  }
  
  await this.save();
  return this;
};

// Method to mark medicine as snoozed
medicineLogSchema.methods.markAsSnoozed = async function(snoozeMinutes = 15) {
  this.status = 'snoozed';
  this.snoozeCount += 1;
  this.snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
  await this.save();
  return this;
};

// Method to mark medicine as skipped
medicineLogSchema.methods.markAsSkipped = async function(reason = '') {
  this.status = 'skipped';
  this.notes = reason || this.notes;
  await this.save();
  return this;
};

// Static method to get today's schedule for a user
medicineLogSchema.statics.getTodaySchedule = async function(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return await this.find({
    userId,
    scheduledTime: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('medicineId').sort({ scheduledTime: 1 });
};

// Export model
module.exports = mongoose.model('MedicineLog', medicineLogSchema);
