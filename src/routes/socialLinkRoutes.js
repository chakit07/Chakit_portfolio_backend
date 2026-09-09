const express = require('express');
const {
  getAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks
} = require('../controllers/socialLinkController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllSocialLinks);
router.post('/', createSocialLink);
router.put('/:id', updateSocialLink);
router.delete('/:id', deleteSocialLink);
router.patch('/reorder', reorderSocialLinks);

module.exports = router;
