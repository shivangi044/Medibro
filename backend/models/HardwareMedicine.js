const mongoose = require('mongoose');

/**
 * Hardware Medicine Schema
 * Stores medicine status for hardware integration
 * Tracks taken, missed, snoozed medicines
 */
const hardwareMedicineSchema = new mongoose.Schema({
  // Medicine reference (optional - can link to main Medicine model)
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    default: null
  },

  // Basic medicine information
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },

  // Hardware slot information
  slot: {
    type: Number,
    required: [true, 'Hardware slot is required'],
    min: 1,
    max: 10
  },

  // Schedule information
  scheduledTime: {
    type: String, // Format: "HH:MM" (24-hour format)
    required: [true, 'Scheduled time is required']
  },
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: [true, 'Date is required']
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed', 'snoozed'],
    default: 'pending',
    required: true
  },

  // Snooze tracking
  snoozeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  snoozedUntil: {
    type: Date,
    default: null
  },

  // Taken time (when status = 'taken')
  takenTime: {
    type: Date,
    default: null
  },

  // Additional metadata
  notes: {
    type: String,
    default: ''
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
});

// Update the updatedAt timestamp before saving
hardwareMedicineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
hardwareMedicineSchema.index({ date: 1, status: 1 });
hardwareMedicineSchema.index({ slot: 1 });
hardwareMedicineSchema.index({ scheduledTime: 1 });

const HardwareMedicine = mongoose.model('HardwareMedicine', hardwareMedicineSchema);

module.exports = HardwareMedicine;
