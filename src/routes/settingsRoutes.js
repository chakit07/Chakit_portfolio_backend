const express = require('express');
const {
  getSettings,
  updateSettings,
  updateVisualEffects,
  updateSectionConfig
} = require('../controllers/settingsController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.patch('/visual-effects', updateVisualEffects);
router.patch('/sections', updateSectionConfig);

module.exports = router;
