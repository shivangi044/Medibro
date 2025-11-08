// Mock medicine data and management
export const mockMedicines = [
  {
    id: 1,
    name: 'Paracetamol',
    dosage: '500mg',
    times: ['09:00', '18:00'],
    frequency: 'twice_daily',
    slot: 'A1',
    quantity: 60,
    remaining: 45,
    description: 'For pain relief and fever reduction',
    sideEffects: 'Mild drowsiness, stomach upset',
    instructions: 'Take with food',
    prescribedBy: 'Dr. Smith',
    startDate: '2024-10-01',
    endDate: '2024-11-30',
    category: 'pain_relief'
  },
  {
    id: 2,
    name: 'Vitamin D',
    dosage: '1000 IU',
    times: ['14:00'],
    frequency: 'daily',
    slot: 'A2',
    quantity: 30,
    remaining: 28,
    description: 'Vitamin D3 supplement for bone health',
    sideEffects: 'None reported',
    instructions: 'Take with a meal containing fat',
    prescribedBy: 'Dr. Johnson',
    startDate: '2024-10-15',
    endDate: '2025-01-15',
    category: 'vitamin'
  },
  {
    id: 3,
    name: 'Omega-3',
    dosage: '1000mg',
    times: ['08:00'],
    frequency: 'daily',
    slot: 'A3',
    quantity: 90,
    remaining: 75,
    description: 'Fish oil for heart and brain health',
    sideEffects: 'Fishy aftertaste',
    instructions: 'Can be taken with or without food',
    prescribedBy: 'Dr. Williams',
    startDate: '2024-09-01',
    endDate: '2024-12-01',
    category: 'supplement'
  }
];

export const mockMedicineHistory = [
  {
    id: 1,
    medicineId: 1,
    scheduledTime: '2024-11-08T09:00:00Z',
    takenTime: '2024-11-08T09:05:00Z',
    status: 'taken',
    slot: 'A1',
    notes: 'Taken on time'
  },
  {
    id: 2,
    medicineId: 2,
    scheduledTime: '2024-11-08T14:00:00Z',
    takenTime: null,
    status: 'pending',
    slot: 'A2',
    notes: null
  },
  {
    id: 3,
    medicineId: 1,
    scheduledTime: '2024-11-07T18:00:00Z',
    takenTime: '2024-11-07T18:30:00Z',
    status: 'taken_late',
    slot: 'A1',
    notes: 'Taken 30 minutes late'
  }
];

// Medicine schedule generator
export const generateTodaySchedule = () => {
  const today = new Date();
  const schedule = [];

  mockMedicines.forEach(medicine => {
    medicine.times.forEach((time, index) => {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Determine status based on current time
      let status = 'pending';
      if (scheduledTime < new Date()) {
        // Past time - randomly assign taken/missed/snoozed for demo
        const rand = Math.random();
        if (rand < 0.7) status = 'taken';
        else if (rand < 0.9) status = 'snoozed';
        else status = 'skipped';
      }

      schedule.push({
        id: `${medicine.id}-${index}-${today.getDate()}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        scheduledTime,
        status,
        slot: medicine.slot,
        instructions: medicine.instructions
      });
    });
  });

  return schedule.sort((a, b) => a.scheduledTime - b.scheduledTime);
};

// Adherence calculation
export const calculateAdherence = (period = 'week') => {
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
  }

  // Mock calculation - in real app would query actual data
  const totalDoses = period === 'week' ? 28 : period === 'month' ? 120 : 1460;
  const takenDoses = Math.floor(totalDoses * (0.8 + Math.random() * 0.15)); // 80-95% adherence

  return {
    period,
    totalDoses,
    takenDoses,
    missedDoses: totalDoses - takenDoses,
    adherenceRate: Math.round((takenDoses / totalDoses) * 100),
    startDate,
    endDate
  };
};

// Medicine analytics
export const getMedicineAnalytics = () => {
  return {
    totalMedicines: mockMedicines.length,
    activeMedicines: mockMedicines.filter(m => m.remaining > 0).length,
    lowStockMedicines: mockMedicines.filter(m => m.remaining < 7).length,
    categorySummary: {
      pain_relief: mockMedicines.filter(m => m.category === 'pain_relief').length,
      vitamin: mockMedicines.filter(m => m.category === 'vitamin').length,
      supplement: mockMedicines.filter(m => m.category === 'supplement').length
    },
    upcomingRefills: mockMedicines
      .filter(m => m.remaining < 14)
      .map(m => ({
        name: m.name,
        daysRemaining: m.remaining,
        refillDate: new Date(Date.now() + m.remaining * 24 * 60 * 60 * 1000)
      }))
  };
};

// AI Insights generator
export const generateAIInsights = (adherenceData) => {
  const insights = [];

  // Adherence insights
  if (adherenceData.adherenceRate >= 90) {
    insights.push({
      type: 'positive',
      title: 'Excellent Adherence!',
      description: `Your ${adherenceData.adherenceRate}% adherence rate is outstanding. Keep up the great work!`,
      priority: 'low'
    });
  } else if (adherenceData.adherenceRate >= 80) {
    insights.push({
      type: 'neutral',
      title: 'Good Progress',
      description: `Your ${adherenceData.adherenceRate}% adherence is good, but there's room for improvement.`,
      priority: 'medium'
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Adherence Needs Attention',
      description: `Your ${adherenceData.adherenceRate}% adherence is below optimal. Consider setting more reminders.`,
      priority: 'high'
    });
  }

  // Pattern insights
  const currentHour = new Date().getHours();
  if (currentHour >= 18) {
    insights.push({
      type: 'tip',
      title: 'Evening Reminder',
      description: 'Evening doses are often missed. Consider taking them right after dinner.',
      priority: 'medium'
    });
  }

  // Stock insights
  const lowStockCount = getMedicineAnalytics().lowStockMedicines;
  if (lowStockCount > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Stock Alert',
      description: `${lowStockCount} medicine(s) are running low. Plan for refills soon.`,
      priority: 'high'
    });
  }

  return insights;
};

// Notification templates
export const notificationTemplates = {
  medicineReminder: (medicineName, dosage) => ({
    title: 'Time for your medicine',
    body: `Don't forget to take ${medicineName} ${dosage}`,
    priority: 'high'
  }),
  
  missedDose: (medicineName) => ({
    title: 'Missed dose reminder',
    body: `You missed your ${medicineName} dose. Take it when convenient.`,
    priority: 'medium'
  }),
  
  lowStock: (medicineName, remaining) => ({
    title: 'Low stock warning',
    body: `${medicineName} has only ${remaining} doses left. Time to refill!`,
    priority: 'high'
  }),
  
  adherenceGoal: (rate) => ({
    title: 'Great job!',
    body: `You've maintained ${rate}% adherence this week. Keep it up!`,
    priority: 'low'
  })
};