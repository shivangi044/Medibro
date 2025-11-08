// Utility functions for the MediBro app

// Date and time utilities
export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isWithinTimeRange = (time, startTime, endTime) => {
  const timeMs = time.getTime();
  const startMs = startTime.getTime();
  const endMs = endTime.getTime();
  
  return timeMs >= startMs && timeMs <= endMs;
};

// Medicine status utilities
export const getMedicineStatusColor = (status) => {
  const colorMap = {
    taken: '#4CAF50',
    pending: '#2E86AB',
    snoozed: '#FF9800',
    skipped: '#F44336',
    overdue: '#9C27B0'
  };
  return colorMap[status] || '#666';
};

export const getMedicineStatusIcon = (status) => {
  const iconMap = {
    taken: 'checkmark-circle',
    pending: 'time-outline',
    snoozed: 'pause-circle',
    skipped: 'close-circle',
    overdue: 'alert-circle'
  };
  return iconMap[status] || 'help-circle';
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
};

// Storage utilities
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
};

export const safeJsonStringify = (object) => {
  try {
    return JSON.stringify(object);
  } catch (error) {
    console.warn('JSON stringify error:', error);
    return null;
  }
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Number utilities
export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// String utilities
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, maxLength) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

// Notification utilities
export const scheduleNotification = async (notification) => {
  // Mock implementation - in real app would use Expo Notifications
  console.log('Scheduling notification:', notification);
  return { success: true, id: Math.random().toString(36) };
};

export const cancelNotification = async (notificationId) => {
  // Mock implementation
  console.log('Cancelling notification:', notificationId);
  return { success: true };
};

// Error handling utilities
export const handleError = (error, context = '') => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // In production, you might want to send to crash reporting service
  // crashlytics().recordError(error);
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    context
  };
};

// Device utilities
export const getDeviceInfo = () => {
  // Mock device info - in real app would use expo-device
  return {
    platform: 'mobile',
    version: '1.0.0',
    buildNumber: '1',
    brand: 'Apple', // or 'Samsung', etc.
    model: 'iPhone 14'
  };
};

// Analytics utilities
export const trackEvent = (eventName, properties = {}) => {
  // Mock implementation - in real app would use analytics service
  console.log('Track event:', eventName, properties);
};

export const trackScreen = (screenName) => {
  // Mock implementation
  console.log('Track screen:', screenName);
};

// Accessibility utilities
export const generateAccessibilityLabel = (text, context = '') => {
  return `${context} ${text}`.trim();
};

export const announceForAccessibility = (message) => {
  // Mock implementation - in real app would use AccessibilityInfo
  console.log('Accessibility announcement:', message);
};

// Constants
export const COLORS = {
  primary: '#2E86AB',
  secondary: '#A23B72',
  accent: '#F18F01',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666'
};

export const SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
};

export const MEDICINE_CATEGORIES = {
  pain_relief: 'Pain Relief',
  antibiotic: 'Antibiotic',
  vitamin: 'Vitamin',
  supplement: 'Supplement',
  heart: 'Heart Medication',
  diabetes: 'Diabetes',
  blood_pressure: 'Blood Pressure',
  other: 'Other'
};

export const MEDICINE_FREQUENCIES = {
  once_daily: 'Once Daily',
  twice_daily: 'Twice Daily',
  three_times_daily: 'Three Times Daily',
  four_times_daily: 'Four Times Daily',
  as_needed: 'As Needed',
  weekly: 'Weekly',
  monthly: 'Monthly'
};