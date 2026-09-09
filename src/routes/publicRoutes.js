const express = require('express');
const {
  getPublicPortfolio,
  getPublicProjectBySlug,
  getSitemapEntries
} = require('../controllers/publicController');
const { submitContact } = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/portfolio', getPublicPortfolio);
router.get('/projects/:slug', getPublicProjectBySlug);
router.get('/sitemap', getSitemapEntries);
router.post('/contact', contactLimiter, submitContact);

module.exports = router;
