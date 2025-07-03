const express = require('express');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../schemas/User');
const Profile = require('../schemas/UserProfile');
const { TokenBlacklist } = require('../schemas/TokenBlacklist');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { 
  loginLimiter, 
  registrationLimiter, 
  authenticateToken, 
  generateTokens,
  csrfProtection 
} = require('../middleware/auth');
const router = express.Router();

// Register new user
router.post('/register', registrationLimiter, validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      username, 
      email, 
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      height,
      weight,
      bloodType,
      medicalConditions,
      allergies,
      currentMedications,
      emergencyContact
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Username or email already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Create user profile
    const profile = new Profile({
      user: user._id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      height,
      weight,
      bloodType,
      medicalConditions,
      allergies,
      currentMedications,
      emergencyContact
    });

    await profile.save();

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id,
      username: user.username,
      profileId: profile._id
    });

    // Set secure HTTP-only cookies
    if (process.env.COOKIE_SECRET) {
      res.cookie('token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
        sameSite: 'strict'
      });
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: process.env.TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // Days to milliseconds
        sameSite: 'strict'
      });
    }

    // Generate CSRF token for future requests
    const csrfToken = jwt.sign({ userId: user._id }, process.env.CSRF_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        tokens,
        csrfToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        profile
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Username or email already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      details: error.message
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token required'
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.exists({ token: refreshToken });
    if (isBlacklisted) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token has been invalidated'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Generate new tokens
    const tokens = generateTokens({
      userId: decoded.userId,
      username: decoded.username,
      profileId: decoded.profileId,
      iat: Math.floor(Date.now() / 1000) // Include issued at time
    });

    // Set secure HTTP-only cookies
    if (process.env.COOKIE_SECRET) {
      res.cookie('token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
        sameSite: 'strict'
      });
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: process.env.TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // Days to milliseconds
        sameSite: 'strict'
      });
    }

    // Generate new CSRF token
    const csrfToken = jwt.sign({ userId: decoded.userId }, process.env.CSRF_SECRET, { expiresIn: '1h' });

    res.json({
      status: 'success',
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }
});

// Login user
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Get user without password
    const userWithoutPassword = await User.findOne({ username }).select('-password');

    // Get user profile
    const profile = await Profile.findOne({ user: userWithoutPassword._id });

    // Generate tokens
    const tokens = generateTokens({
      userId: userWithoutPassword._id,
      username: userWithoutPassword.username,
      profileId: profile._id,
      iat: Math.floor(Date.now() / 1000) // Include issued at time
    });

    // Set secure HTTP-only cookies
    if (process.env.COOKIE_SECRET) {
      res.cookie('token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
        sameSite: 'strict'
      });
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: process.env.TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // Days to milliseconds
        sameSite: 'strict'
      });
    }

    // Generate CSRF token for future requests
    const csrfToken = jwt.sign({ userId: user._id }, process.env.CSRF_SECRET, { expiresIn: '1h' });

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        tokens,
        csrfToken,
        user: {
          id: userWithoutPassword._id,
          username: userWithoutPassword.username,
          email: userWithoutPassword.email
        },
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      details: error.message
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const profile = await Profile.findOne({ user: user._id });

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user data',
      details: error.message
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Get token from header or cookie
    let token = null;
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || (req.cookies && req.cookies.refreshToken);
    
    // Add tokens to blacklist
    if (token) {
      await TokenBlacklist.create({ token });
    }
    
    if (refreshToken) {
      await TokenBlacklist.create({ token: refreshToken });
    }

    // Clear cookies if they exist
    if (req.cookies) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
      details: error.message
    });
  }
});

// CSRF token route - for SPA to get a new CSRF token when needed
router.get('/csrf-token', authenticateToken, (req, res) => {
  try {
    const csrfToken = jwt.sign({ userId: req.user.userId }, process.env.CSRF_SECRET, { expiresIn: '1h' });
    
    res.json({
      status: 'success',
      csrfToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate CSRF token'
    });
  }
});

module.exports = router;
