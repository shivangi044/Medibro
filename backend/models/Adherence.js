const mongoose = require('mongoose');

/**
 * Adherence Schema
 * Stores calculated adherence statistics
 * This helps in analytics and AI insights
 */
const adherenceSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Time period
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },

  // Statistics
  totalScheduledDoses: {
    type: Number,
    default: 0
  },
  takenDoses: {
    type: Number,
    default: 0
  },
  missedDoses: {
    type: Number,
    default: 0
  },
  snoozedDoses: {
    type: Number,
    default: 0
  },
  skippedDoses: {
    type: Number,
    default: 0
  },

  // Adherence rate (percentage)
  adherenceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // On-time statistics
  onTimeDoses: {
    type: Number,
    default: 0
  },
  lateDoses: {
    type: Number,
    default: 0
  },
  averageDelayMinutes: {
    type: Number,
    default: 0
  },

  // Medicine-wise breakdown
  medicineBreakdown: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    medicineName: String,
    scheduled: Number,
    taken: Number,
    adherenceRate: Number
  }],

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

// Indexes
adherenceSchema.index({ userId: 1, period: 1, startDate: -1 });

// Method to calculate adherence rate
adherenceSchema.methods.calculateAdherenceRate = function() {
  if (this.totalScheduledDoses === 0) {
    this.adherenceRate = 0;
  } else {
    this.adherenceRate = Math.round((this.takenDoses / this.totalScheduledDoses) * 100);
  }
  return this.adherenceRate;
};

// Static method to calculate and save adherence for a period
adherenceSchema.statics.calculateForPeriod = async function(userId, period, startDate, endDate) {
  const MedicineLog = mongoose.model('MedicineLog');
  
  // Get all logs for the period
  const logs = await MedicineLog.find({
    userId,
    scheduledTime: {
      $gte: startDate,
      $lte: endDate
    }
  });

  // Calculate statistics
  const stats = {
    totalScheduledDoses: logs.length,
    takenDoses: logs.filter(log => log.status === 'taken' || log.status === 'taken_late').length,
    missedDoses: logs.filter(log => log.status === 'skipped').length,
    snoozedDoses: logs.filter(log => log.status === 'snoozed').length,
    skippedDoses: logs.filter(log => log.status === 'skipped').length,
    onTimeDoses: logs.filter(log => log.isOnTime === true).length,
    lateDoses: logs.filter(log => log.status === 'taken_late').length,
  };

  // Calculate average delay
  const lateLogs = logs.filter(log => log.delayMinutes > 0);
  stats.averageDelayMinutes = lateLogs.length > 0
    ? Math.round(lateLogs.reduce((sum, log) => sum + log.delayMinutes, 0) / lateLogs.length)
    : 0;

  // Create or update adherence record
  const adherence = await this.findOneAndUpdate(
    { userId, period, startDate, endDate },
    {
      ...stats,
      adherenceRate: stats.totalScheduledDoses > 0
        ? Math.round((stats.takenDoses / stats.totalScheduledDoses) * 100)
        : 0
    },
    { upsert: true, new: true }
  );

  return adherence;
};

// Export model
module.exports = mongoose.model('Adherence', adherenceSchema);
