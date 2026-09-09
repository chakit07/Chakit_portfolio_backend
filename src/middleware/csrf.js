const crypto = require('crypto');

const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
  // Methods that change state
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  // Skip CSRF check for safe methods
  if (!mutationMethods.includes(req.method)) {
    return next();
  }

  // Exempt public contact endpoint from CSRF so external public visitors can submit forms,
  // contact endpoint has rate-limiting and honeypot protection instead.
  if (req.path === '/api/v1/public/contact' || req.path === '/contact') {
    return next();
  }

  // Exempt auth login endpoint
  if (req.path === '/api/v1/auth/login' || req.path === '/login') {
    return next();
  }

  // Exempt public AI endpoints (chat, match-job, summarize-project) protected by rate limiting
  const publicAiPaths = [
    '/api/v1/ai/chat', '/ai/chat',
    '/api/v1/ai/match-job', '/ai/match-job',
    '/api/v1/ai/summarize-project', '/ai/summarize-project'
  ];
  if (publicAiPaths.includes(req.path)) {
    return next();
  }

  const tokenFromHeader = req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies.csrfToken;

  if (!tokenFromCookie || !tokenFromHeader || tokenFromHeader !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Request blocked for security.'
    });
  }

  next();
};

const setCsrfCookie = (res) => {
  const token = generateCsrfToken();
  res.cookie('csrfToken', token, {
    httpOnly: false, // Must be readable by client JS to set in request header
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
};

module.exports = {
  csrfProtection,
  setCsrfCookie,
  generateCsrfToken
};
