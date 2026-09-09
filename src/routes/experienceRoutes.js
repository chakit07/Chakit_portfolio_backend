const express = require('express');
const {
  getAllExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperience
} = require('../controllers/experienceController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllExperience);
router.post('/', createExperience);
router.put('/:id', updateExperience);
router.delete('/:id', deleteExperience);
router.patch('/reorder', reorderExperience);

module.exports = router;
