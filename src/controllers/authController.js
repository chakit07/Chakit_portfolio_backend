const crypto = require('crypto');
const Admin = require('../models/Admin');
const Session = require('../models/Session');
const { setCsrfCookie, generateCsrfToken } = require('../middleware/csrf');
const env = require('../config/env');

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const setSessionCookie = (res, sessionId) => {
  // SameSite must be 'none' when frontend & backend are on different domains (Vercel + Render).
  // 'lax' (the browser default) silently drops cross-site cookies, causing 401 on every request.
  // SameSite=None requires Secure=true (HTTPS), which Render always provides in production.
  const isProduction = env.IS_PRODUCTION;
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: isProduction,          // Must be true when SameSite=none
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin prod, 'lax' for local dev
    maxAge: SESSION_DURATION_MS,
    path: '/'
  });
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const admin = await Admin.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }]
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials provided.'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials provided.'
      });
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await Session.create({
      sessionId,
      adminId: admin._id,
      expiresAt,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || req.connection.remoteAddress || ''
    });

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    setSessionCookie(res, sessionId);
    const csrfToken = setCsrfCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      csrfToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  const csrfToken = setCsrfCookie(res);
  res.status(200).json({
    success: true,
    admin: req.admin,
    csrfToken
  });
};

const logout = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await Session.deleteOne({ sessionId });
    }

    const isProduction = env.IS_PRODUCTION;
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    res.clearCookie('csrfToken', {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are both required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    await admin.save();

    // Invalidate all existing sessions for this admin
    await Session.deleteMany({ adminId: admin._id });

    // Establish a new session for the current user
    const newSessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await Session.create({
      sessionId: newSessionId,
      adminId: admin._id,
      expiresAt,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || ''
    });

    setSessionCookie(res, newSessionId);
    const csrfToken = setCsrfCookie(res);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. All previous sessions invalidated.',
      csrfToken
    });
  } catch (error) {
    next(error);
  }
};

const getCsrf = async (req, res) => {
  const csrfToken = setCsrfCookie(res);
  res.status(200).json({
    success: true,
    csrfToken
  });
};

module.exports = {
  login,
  me,
  logout,
  changePassword,
  getCsrf
};
