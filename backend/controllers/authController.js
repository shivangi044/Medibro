const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      username,
      password,
      name,
      age,
      gender,
      medicalConditions,
      emergencyContact,
      doctorName,
      doctorPhone
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ username: username.toLowerCase() });
    
    if (userExists) {
      res.status(400);
      return next(new Error('Username already exists'));
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      password,
      name,
      age,
      gender,
      medicalConditions,
      emergencyContact,
      doctorName,
      doctorPhone
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          username: user.username,
          name: user.name,
          age: user.age,
          gender: user.gender,
          setupComplete: user.setupComplete,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401);
      return next(new Error('Invalid username or password'));
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      res.status(401);
      return next(new Error('Invalid username or password'));
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        age: user.age,
        gender: user.gender,
        setupComplete: user.setupComplete,
        bluetoothConnected: user.bluetoothConnected,
        connectedBotId: user.connectedBotId,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        name: user.name,
        age: user.age,
        gender: user.gender,
        medicalConditions: user.medicalConditions,
        emergencyContact: user.emergencyContact,
        doctorName: user.doctorName,
        doctorPhone: user.doctorPhone,
        connectedBotId: user.connectedBotId,
        bluetoothConnected: user.bluetoothConnected,
        setupComplete: user.setupComplete,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.age = req.body.age || user.age;
    user.gender = req.body.gender || user.gender;
    user.medicalConditions = req.body.medicalConditions !== undefined 
      ? req.body.medicalConditions 
      : user.medicalConditions;
    user.emergencyContact = req.body.emergencyContact !== undefined 
      ? req.body.emergencyContact 
      : user.emergencyContact;
    user.doctorName = req.body.doctorName !== undefined 
      ? req.body.doctorName 
      : user.doctorName;
    user.doctorPhone = req.body.doctorPhone !== undefined 
      ? req.body.doctorPhone 
      : user.doctorPhone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        age: updatedUser.age,
        gender: updatedUser.gender,
        medicalConditions: updatedUser.medicalConditions,
        emergencyContact: updatedUser.emergencyContact,
        doctorName: updatedUser.doctorName,
        doctorPhone: updatedUser.doctorPhone
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete setup (after Bluetooth pairing)
 * @route   POST /api/auth/complete-setup
 * @access  Private
 */
const completeSetup = async (req, res, next) => {
  try {
    const { connectedBotId } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.setupComplete = true;
    user.bluetoothConnected = true;
    user.connectedBotId = connectedBotId || `MD-BOT-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

    await user.save();

    res.json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        setupComplete: user.setupComplete,
        bluetoothConnected: user.bluetoothConnected,
        connectedBotId: user.connectedBotId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  completeSetup
};
