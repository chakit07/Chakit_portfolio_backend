const express = require('express');
const {
  getAllEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation
} = require('../controllers/educationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllEducation);
router.post('/', createEducation);
router.put('/:id', updateEducation);
router.delete('/:id', deleteEducation);
router.patch('/reorder', reorderEducation);

module.exports = router;
