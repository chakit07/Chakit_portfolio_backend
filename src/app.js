const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const env = require('./config/env');
const apiRoutes = require('./routes/index');
const { sanitizeInput } = require('./middleware/sanitize');
const { csrfProtection } = require('./middleware/csrf');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust the first proxy hop (required on Render, Railway, Heroku, etc.)
// Without this, express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// because the X-Forwarded-For header is set by the cloud reverse proxy but
// Express doesn't trust it by default (trust proxy = false).
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows uploaded images to be requested from frontend domain
    contentSecurityPolicy: false // Handled by frontend Next.js headers
  })
);

// CORS configuration supporting credentials (cookies)
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching frontend
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Accept']
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.SESSION_SECRET));

// Input sanitization against MongoDB operator injection
app.use(sanitizeInput);

// CSRF protection for mutation requests
app.use(csrfProtection);

// Serve uploaded files statically
app.use('/uploads', express.static(env.UPLOAD_DIR, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Mount API routes
app.use('/api/v1', apiRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
