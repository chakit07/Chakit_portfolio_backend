const express = require('express');
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Rate limiter for public AI interactions (chat, job matching, summary)
const publicAiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 AI queries per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI rate limit reached. Please wait a few moments before asking more questions.'
  }
});

// Public endpoints
router.get('/status', aiController.getAiStatus);
router.post('/chat', publicAiLimiter, aiController.chat);
router.post('/match-job', publicAiLimiter, aiController.matchJob);
router.post('/summarize-project', publicAiLimiter, aiController.summarizeProject);

// Admin-protected endpoints
router.post('/generate-case-study', requireAuth, aiController.generateCaseStudy);
router.post('/reply-draft', requireAuth, aiController.generateReplyDraft);
router.post('/polish-text', requireAuth, aiController.polishText);

module.exports = router;
