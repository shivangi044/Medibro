const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores patient information and authentication details
 */
const userSchema = new mongoose.Schema({
  // Authentication fields
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // Personal Information
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: [1, 'Age must be positive']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },

  // Medical Information
  medicalConditions: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  doctorName: {
    type: String,
    default: ''
  },
  doctorPhone: {
    type: String,
    default: ''
  },

  // Device Information
  connectedBotId: {
    type: String,
    default: null
  },
  bluetoothConnected: {
    type: Boolean,
    default: false
  },

  // Setup status
  setupComplete: {
    type: Boolean,
    default: false
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

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export model
module.exports = mongoose.model('User', userSchema);
