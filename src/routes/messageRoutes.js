const express = require('express');
const {
  getAllMessages,
  markReadStatus,
  toggleArchive,
  deleteMessage
} = require('../controllers/contactController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllMessages);
router.patch('/:id/read', markReadStatus);
router.patch('/:id/archive', toggleArchive);
router.delete('/:id', deleteMessage);

module.exports = router;
