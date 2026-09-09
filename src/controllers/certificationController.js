const Certification = require('../models/Certification');

const getAllCertifications = async (req, res, next) => {
  try {
    const certs = await Certification.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: certs });
  } catch (error) {
    next(error);
  }
};

const createCertification = async (req, res, next) => {
  try {
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, image, order } = req.body;

    if (!name || !issuer || !issueDate) {
      return res.status(400).json({ success: false, message: 'Name, issuer, and issue date are required.' });
    }

    const maxOrder = await Certification.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 0);

    const cert = await Certification.create({
      name: name.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim(),
      expiryDate: expiryDate || '',
      credentialId: credentialId || '',
      credentialUrl: credentialUrl || '',
      image: image || '',
      order: nextOrder
    });

    res.status(201).json({ success: true, message: 'Certification created.', data: cert });
  } catch (error) {
    next(error);
  }
};

const updateCertification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cert = await Certification.findById(id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found.' });
    }

    const fields = ['name', 'issuer', 'issueDate', 'expiryDate', 'credentialId', 'credentialUrl', 'image', 'order'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        cert[field] = req.body[field];
      }
    });

    await cert.save();
    res.status(200).json({ success: true, message: 'Certification updated.', data: cert });
  } catch (error) {
    next(error);
  }
};

const deleteCertification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cert = await Certification.findByIdAndDelete(id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found.' });
    }
    res.status(200).json({ success: true, message: 'Certification deleted.' });
  } catch (error) {
    next(error);
  }
};

const reorderCertifications = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required.' });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: Number(item.order) } }
      }
    }));

    await Certification.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Certifications reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  reorderCertifications
};
