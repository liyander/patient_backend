const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { TokenBlacklist } = require('../schemas/TokenBlacklist');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: process.env.LOGIN_WINDOW_MINUTES * 60 * 1000, // From env variable
  max: process.env.MAX_LOGIN_ATTEMPTS, // From env variable
  message: {
    status: 'error',
    message: `Too many login attempts, please try again after ${process.env.LOGIN_WINDOW_MINUTES} minutes`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per window
  message: {
    status: 'error',
    message: 'Too many registration attempts, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = null;
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.exists({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been invalidated'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Generate tokens with environment variable expiry times
const generateTokens = (userData) => {
  const accessToken = jwt.sign(
    userData,
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
  );

  const refreshToken = jwt.sign(
    userData,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  return { accessToken, refreshToken };
};

// Refresh token middleware
const refreshToken = async (req, res, next) => {
  try {
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
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: decoded.userId,
      username: decoded.username,
      profileId: decoded.profileId,
      iat: Math.floor(Date.now() / 1000) // Include issued at time
    });

    // Set HTTP-only cookies if cookie secret exists
    if (process.env.COOKIE_SECRET) {
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
        sameSite: 'strict'
      });
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: process.env.TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // Days to milliseconds
        sameSite: 'strict'
      });
    }

    res.json({
      status: 'success',
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    });
  }
};

// CSRF Protection middleware
const csrfProtection = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  
  if (!csrfToken) {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token is required'
    });
  }

  try {
    // Verify the CSRF token using JWT verification
    const decoded = jwt.verify(csrfToken, process.env.CSRF_SECRET);
    
    // Optionally, you can verify that the userId in the CSRF token matches the authenticated user
    if (req.user && decoded.userId !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'CSRF token validation failed: user mismatch'
      });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid CSRF token'
    });
  }
};

module.exports = {
  loginLimiter,
  registrationLimiter,
  authenticateToken,
  generateTokens,
  refreshToken,
  csrfProtection
};
