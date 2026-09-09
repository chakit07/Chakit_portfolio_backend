const express = require('express');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects
} = require('../controllers/projectController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Category endpoints
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Project endpoints
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.patch('/reorder', reorderProjects);

module.exports = router;
