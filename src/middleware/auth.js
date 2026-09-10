const Session = require('../models/Session');
const Admin = require('../models/Admin');

const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No active session found.'
      });
    }

    const session = await Session.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      // Clear invalid cookie — options must exactly match those used when setting it
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('sessionId', {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/'
      });
      return res.status(401).json({
        success: false,
        message: 'Session has expired or is invalid. Please log in again.'
      });
    }

    const admin = await Admin.findById(session.adminId).select('-passwordHash');
    if (!admin) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        success: false,
        message: 'Administrator account no longer exists.'
      });
    }

    req.session = session;
    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth };
