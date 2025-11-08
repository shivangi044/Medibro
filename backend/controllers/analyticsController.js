const MedicineLog = require('../models/MedicineLog');
const Medicine = require('../models/Medicine');
const Adherence = require('../models/Adherence');

/**
 * @desc    Get adherence statistics for a period
 * @route   GET /api/analytics/adherence
 * @access  Private
 */
const getAdherenceStats = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query; // week, month, year

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get all logs for the period
    const logs = await MedicineLog.find({
      userId: req.user._id,
      scheduledTime: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate statistics
    const totalScheduled = logs.length;
    const taken = logs.filter(log => log.status === 'taken' || log.status === 'taken_late').length;
    const missed = logs.filter(log => log.status === 'skipped').length;
    const snoozed = logs.filter(log => log.status === 'snoozed').length;
    const pending = logs.filter(log => log.status === 'pending').length;
    const onTime = logs.filter(log => log.isOnTime === true).length;
    const late = logs.filter(log => log.status === 'taken_late').length;

    const adherenceRate = totalScheduled > 0 
      ? Math.round((taken / totalScheduled) * 100) 
      : 0;

    // Calculate average delay
    const lateLogs = logs.filter(log => log.delayMinutes > 0);
    const averageDelay = lateLogs.length > 0
      ? Math.round(lateLogs.reduce((sum, log) => sum + log.delayMinutes, 0) / lateLogs.length)
      : 0;

    // Daily breakdown for charts
    const dailyData = getDailyBreakdown(logs, startDate, endDate);

    // Medicine-wise breakdown
    const medicineBreakdown = await getMedicineBreakdown(req.user._id, logs);

    res.json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        overview: {
          totalScheduled,
          taken,
          missed,
          snoozed,
          pending,
          adherenceRate,
          onTime,
          late,
          averageDelay
        },
        dailyData,
        medicineBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI insights and recommendations
 * @route   GET /api/analytics/insights
 * @access  Private
 */
const getAIInsights = async (req, res, next) => {
  try {
    // Get recent adherence data (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const logs = await MedicineLog.find({
      userId: req.user._id,
      scheduledTime: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const insights = [];

    // Calculate adherence rate
    const totalScheduled = logs.length;
    const taken = logs.filter(log => log.status === 'taken' || log.status === 'taken_late').length;
    const adherenceRate = totalScheduled > 0 
      ? Math.round((taken / totalScheduled) * 100) 
      : 0;

    // Insight 1: Overall adherence
    if (adherenceRate >= 90) {
      insights.push({
        type: 'positive',
        icon: 'trending-up',
        title: 'Excellent Adherence!',
        description: `Your adherence rate of ${adherenceRate}% is outstanding. Keep up the great work!`,
        priority: 'low'
      });
    } else if (adherenceRate >= 80) {
      insights.push({
        type: 'neutral',
        icon: 'information-circle',
        title: 'Good Progress',
        description: `Your ${adherenceRate}% adherence is good, but there's room for improvement.`,
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'warning',
        icon: 'alert-circle',
        title: 'Adherence Needs Attention',
        description: `Your ${adherenceRate}% adherence is below optimal. Consider setting more reminders.`,
        priority: 'high'
      });
    }

    // Insight 2: Time-based patterns
    const timePatterns = analyzeTimePatterns(logs);
    if (timePatterns.worstTimeSlot) {
      insights.push({
        type: 'tip',
        icon: 'time',
        title: 'Time Pattern Detected',
        description: `You tend to miss more doses in the ${timePatterns.worstTimeSlot}. Consider adjusting your schedule or setting stronger reminders.`,
        priority: 'medium'
      });
    }

    // Insight 3: Streak tracking
    const currentStreak = calculateStreak(logs);
    if (currentStreak >= 7) {
      insights.push({
        type: 'positive',
        icon: 'flame',
        title: `${currentStreak}-Day Streak!`,
        description: `You've maintained consistency for ${currentStreak} days. Excellent discipline!`,
        priority: 'low'
      });
    }

    // Insight 4: Prediction
    if (adherenceRate >= 85) {
      insights.push({
        type: 'prediction',
        icon: 'analytics',
        title: 'Prediction',
        description: 'If current trend continues, you\'ll reach 95% adherence by next month.',
        priority: 'low'
      });
    }

    // Insight 5: Medicine-specific
    const medicines = await Medicine.find({ 
      userId: req.user._id, 
      isActive: true,
      remaining: { $lt: 7 }
    });

    if (medicines.length > 0) {
      insights.push({
        type: 'warning',
        icon: 'warning',
        title: 'Low Stock Alert',
        description: `${medicines.length} medicine(s) are running low. Consider refilling soon.`,
        priority: 'high'
      });
    }

    res.json({
      success: true,
      count: insights.length,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weekly pattern analysis
 * @route   GET /api/analytics/patterns
 * @access  Private
 */
const getPatternAnalysis = async (req, res, next) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const logs = await MedicineLog.find({
      userId: req.user._id,
      scheduledTime: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Day of week analysis
    const dayStats = Array(7).fill(0).map(() => ({ total: 0, taken: 0 }));
    
    logs.forEach(log => {
      const day = new Date(log.scheduledTime).getDay();
      dayStats[day].total++;
      if (log.status === 'taken' || log.status === 'taken_late') {
        dayStats[day].taken++;
      }
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayAnalysis = dayStats.map((stat, index) => ({
      day: dayNames[index],
      adherenceRate: stat.total > 0 ? Math.round((stat.taken / stat.total) * 100) : 0,
      total: stat.total,
      taken: stat.taken
    }));

    // Find best and worst days
    const sortedDays = [...dayAnalysis].sort((a, b) => b.adherenceRate - a.adherenceRate);
    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];

    // Time of day analysis
    const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const timeSlotsTaken = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    logs.forEach(log => {
      const hour = new Date(log.scheduledTime).getHours();
      let slot;
      if (hour >= 5 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 17) slot = 'afternoon';
      else if (hour >= 17 && hour < 21) slot = 'evening';
      else slot = 'night';

      timeSlots[slot]++;
      if (log.status === 'taken' || log.status === 'taken_late') {
        timeSlotsTaken[slot]++;
      }
    });

    const timeAnalysis = Object.keys(timeSlots).map(slot => ({
      timeSlot: slot,
      adherenceRate: timeSlots[slot] > 0 
        ? Math.round((timeSlotsTaken[slot] / timeSlots[slot]) * 100) 
        : 0,
      total: timeSlots[slot],
      taken: timeSlotsTaken[slot]
    }));

    const sortedTimes = [...timeAnalysis].sort((a, b) => b.adherenceRate - a.adherenceRate);
    const bestTime = sortedTimes[0];

    res.json({
      success: true,
      data: {
        dayAnalysis,
        bestDay,
        worstDay,
        timeAnalysis,
        bestTime
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get daily breakdown
 */
function getDailyBreakdown(logs, startDate, endDate) {
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const dailyData = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.scheduledTime);
      return logDate.toDateString() === date.toDateString();
    });

    const taken = dayLogs.filter(log => log.status === 'taken' || log.status === 'taken_late').length;
    const total = dayLogs.length;
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      adherenceRate: total > 0 ? Math.round((taken / total) * 100) : 0,
      total,
      taken
    });
  }

  return dailyData;
}

/**
 * Helper function to get medicine-wise breakdown
 */
async function getMedicineBreakdown(userId, logs) {
  const medicineStats = {};

  logs.forEach(log => {
    const medicineId = log.medicineId.toString();
    
    if (!medicineStats[medicineId]) {
      medicineStats[medicineId] = {
        medicineId,
        medicineName: log.medicineName,
        total: 0,
        taken: 0
      };
    }

    medicineStats[medicineId].total++;
    if (log.status === 'taken' || log.status === 'taken_late') {
      medicineStats[medicineId].taken++;
    }
  });

  return Object.values(medicineStats).map(stat => ({
    ...stat,
    adherenceRate: stat.total > 0 ? Math.round((stat.taken / stat.total) * 100) : 0
  }));
}

/**
 * Helper function to analyze time patterns
 */
function analyzeTimePatterns(logs) {
  const timeSlots = { morning: [], afternoon: [], evening: [], night: [] };

  logs.forEach(log => {
    const hour = new Date(log.scheduledTime).getHours();
    let slot;
    if (hour >= 5 && hour < 12) slot = 'morning';
    else if (hour >= 12 && hour < 17) slot = 'afternoon';
    else if (hour >= 17 && hour < 21) slot = 'evening';
    else slot = 'night';

    timeSlots[slot].push(log);
  });

  let worstTimeSlot = null;
  let lowestRate = 100;

  Object.keys(timeSlots).forEach(slot => {
    const slotLogs = timeSlots[slot];
    if (slotLogs.length > 0) {
      const taken = slotLogs.filter(log => log.status === 'taken' || log.status === 'taken_late').length;
      const rate = Math.round((taken / slotLogs.length) * 100);
      
      if (rate < lowestRate) {
        lowestRate = rate;
        worstTimeSlot = slot;
      }
    }
  });

  return { worstTimeSlot, adherenceRate: lowestRate };
}

/**
 * Helper function to calculate current streak
 */
function calculateStreak(logs) {
  // Sort logs by date (most recent first)
  const sortedLogs = [...logs].sort((a, b) => b.scheduledTime - a.scheduledTime);
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Group logs by date
  const logsByDate = {};
  sortedLogs.forEach(log => {
    const date = new Date(log.scheduledTime).toISOString().split('T')[0];
    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }
    logsByDate[date].push(log);
  });

  // Check consecutive days
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayLogs = logsByDate[dateStr];
    
    if (!dayLogs || dayLogs.length === 0) break;
    
    const allTaken = dayLogs.every(log => log.status === 'taken' || log.status === 'taken_late');
    if (!allTaken) break;
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

module.exports = {
  getAdherenceStats,
  getAIInsights,
  getPatternAnalysis
};
