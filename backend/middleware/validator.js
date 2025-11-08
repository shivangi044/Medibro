const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('age')
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for adding medicine
 */
const addMedicineValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required'),
  
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required'),
  
  body('times')
    .isArray({ min: 1 })
    .withMessage('At least one time is required'),
  
  body('times.*')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  
  body('slot')
    .trim()
    .notEmpty()
    .withMessage('Hardware slot is required'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive number'),
  
  body('remaining')
    .isInt({ min: 0 })
    .withMessage('Remaining quantity must be a non-negative number'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'custom'])
    .withMessage('Invalid frequency'),
  
  body('category')
    .optional()
    .isIn(['pain_relief', 'antibiotic', 'vitamin', 'supplement', 'chronic_disease', 'other'])
    .withMessage('Invalid category')
];

/**
 * Validation rules for updating medicine log status
 */
const updateLogStatusValidation = [
  body('status')
    .isIn(['taken', 'snoozed', 'skipped'])
    .withMessage('Status must be taken, snoozed, or skipped'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  
  body('snoozeMinutes')
    .optional()
    .isInt({ min: 5, max: 120 })
    .withMessage('Snooze minutes must be between 5 and 120')
];

/**
 * Validation for MongoDB ObjectId
 */
const objectIdValidation = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`)
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  addMedicineValidation,
  updateLogStatusValidation,
  objectIdValidation
};
