const express = require('express');
const { getAllMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllMedia);
router.post('/upload', upload.single('file'), uploadMedia);
router.delete('/:id', deleteMedia);

module.exports = router;
