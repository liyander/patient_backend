const { body } = require('express-validator');

const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores')
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .withMessage('Password must contain at least one letter, one number and one special character'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens and apostrophes')
    .escape(),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens and apostrophes')
    .escape(),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be either male, female, or other'),
  
  body('height')
    .optional()
    .isFloat({ min: 0, max: 300 })
    .withMessage('Height must be a valid number between 0 and 300 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Weight must be a valid number between 0 and 500 kg'),
  
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  
  body('medicalConditions')
    .optional()
    .isArray()
    .withMessage('Medical conditions must be an array')
    .custom(value => {
      if (!value.every(item => typeof item === 'string')) {
        throw new Error('Medical conditions must be strings');
      }
      return true;
    }),
  
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array')
    .custom(value => {
      if (!value.every(item => typeof item === 'string')) {
        throw new Error('Allergies must be strings');
      }
      return true;
    }),
  
  body('currentMedications')
    .optional()
    .isArray()
    .withMessage('Current medications must be an array')
    .custom(value => {
      if (!value.every(item => typeof item === 'string')) {
        throw new Error('Medications must be strings');
      }
      return true;
    }),
  
  body('emergencyContact.name')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Emergency contact name can only contain letters, spaces, hyphens and apostrophes')
    .escape(),
  
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Relationship can only contain letters, spaces, hyphens and apostrophes')
    .escape(),
  
  body('emergencyContact.phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please provide a valid phone number')
    .escape()
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .escape(),
  
  body('password')
    .exists()
    .withMessage('Password is required')
    .notEmpty()
    .withMessage('Password cannot be empty')
];

module.exports = {
  validateRegistration,
  validateLogin
};
