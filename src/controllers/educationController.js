const Education = require('../models/Education');

const getAllEducation = async (req, res, next) => {
  try {
    const records = await Education.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const createEducation = async (req, res, next) => {
  try {
    const { institution, degree, field, startDate, endDate, description, order } = req.body;

    if (!institution || !degree || !startDate) {
      return res.status(400).json({ success: false, message: 'Institution, degree, and start date are required.' });
    }

    const maxOrder = await Education.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 0);

    const record = await Education.create({
      institution: institution.trim(),
      degree: degree.trim(),
      field: field || '',
      startDate: startDate.trim(),
      endDate: endDate || '',
      description: description || '',
      order: nextOrder
    });

    res.status(201).json({ success: true, message: 'Education record created.', data: record });
  } catch (error) {
    next(error);
  }
};

const updateEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await Education.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Education record not found.' });
    }

    const fields = ['institution', 'degree', 'field', 'startDate', 'endDate', 'description', 'order'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    await record.save();
    res.status(200).json({ success: true, message: 'Education record updated.', data: record });
  } catch (error) {
    next(error);
  }
};

const deleteEducation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await Education.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Education record not found.' });
    }
    res.status(200).json({ success: true, message: 'Education record deleted.' });
  } catch (error) {
    next(error);
  }
};

const reorderEducation = async (req, res, next) => {
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

    await Education.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Education records reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  reorderEducation
};
