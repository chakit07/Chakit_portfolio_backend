const express = require('express');
const {
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  reorderCertifications
} = require('../controllers/certificationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllCertifications);
router.post('/', createCertification);
router.put('/:id', updateCertification);
router.delete('/:id', deleteCertification);
router.patch('/reorder', reorderCertifications);

module.exports = router;
