const express = require('express');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills
} = require('../controllers/skillController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/', getAllSkills);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);
router.patch('/reorder', reorderSkills);

module.exports = router;
