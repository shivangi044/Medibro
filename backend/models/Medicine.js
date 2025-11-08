const mongoose = require('mongoose');

/**
 * Medicine Schema
 * Stores medicine information and prescription details
 */
const medicineSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },

  // Basic medicine information
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },

  // Schedule information
  times: [{
    type: String, // Format: "HH:MM" (24-hour format)
    required: true
  }],
  frequency: {
    type: String,
    enum: ['daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'custom'],
    default: 'daily'
  },

  // Hardware slot information
  slot: {
    type: String,
    required: [true, 'Hardware slot is required'],
    trim: true
  },

  // Stock information
  quantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  remaining: {
    type: Number,
    required: [true, 'Remaining quantity is required'],
    min: [0, 'Remaining quantity cannot be negative']
  },

  // Medicine details
  description: {
    type: String,
    default: ''
  },
  sideEffects: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },

  // Prescription information
  prescribedBy: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },

  // Category/Type
  category: {
    type: String,
    enum: ['pain_relief', 'antibiotic', 'vitamin', 'supplement', 'chronic_disease', 'other'],
    default: 'other'
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
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

// Index for faster queries
medicineSchema.index({ userId: 1, isActive: 1 });
medicineSchema.index({ userId: 1, slot: 1 });

// Virtual for low stock alert
medicineSchema.virtual('isLowStock').get(function() {
  return this.remaining < 7; // Alert when less than 7 doses remaining
});

// Method to decrement remaining quantity
medicineSchema.methods.decrementRemaining = async function() {
  if (this.remaining > 0) {
    this.remaining -= 1;
    await this.save();
  }
  return this;
};

// Export model
module.exports = mongoose.model('Medicine', medicineSchema);
