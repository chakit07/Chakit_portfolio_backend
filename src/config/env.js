const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev_session_secret_key_32_characters_long',
  CSRF_SECRET: process.env.CSRF_SECRET || 'dev_csrf_secret_key_32_characters_long',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  UPLOAD_DIR: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
  MAX_FILE_SIZE_BYTES: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
};

module.exports = env;
