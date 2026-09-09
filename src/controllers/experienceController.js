const Experience = require('../models/Experience');

const getAllExperience = async (req, res, next) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    next(error);
  }
};

const createExperience = async (req, res, next) => {
  try {
    const { company, role, employmentType, location, startDate, endDate, isCurrent, description, bullets, logo, website, order } = req.body;

    if (!company || !role || !startDate) {
      return res.status(400).json({ success: false, message: 'Company, role, and start date are required.' });
    }

    const maxOrder = await Experience.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 0);

    const experience = await Experience.create({
      company: company.trim(),
      role: role.trim(),
      employmentType: employmentType || 'Full-time',
      location: location || '',
      startDate: startDate.trim(),
      endDate: isCurrent ? 'Present' : (endDate || ''),
      isCurrent: Boolean(isCurrent),
      description: description || '',
      bullets: Array.isArray(bullets) ? bullets : (typeof bullets === 'string' ? bullets.split('\n').filter(Boolean) : []),
      logo: logo || '',
      website: website || '',
      order: nextOrder
    });

    res.status(201).json({ success: true, message: 'Experience entry created.', data: experience });
  } catch (error) {
    next(error);
  }
};

const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience record not found.' });
    }

    const fields = ['company', 'role', 'employmentType', 'location', 'startDate', 'endDate', 'isCurrent', 'description', 'bullets', 'logo', 'website', 'order'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'bullets' && typeof req.body[field] === 'string') {
          experience[field] = req.body[field].split('\n').filter(Boolean);
        } else {
          experience[field] = req.body[field];
        }
      }
    });

    if (experience.isCurrent) {
      experience.endDate = 'Present';
    }

    await experience.save();
    res.status(200).json({ success: true, message: 'Experience updated.', data: experience });
  } catch (error) {
    next(error);
  }
};

const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findByIdAndDelete(id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience record not found.' });
    }
    res.status(200).json({ success: true, message: 'Experience deleted.' });
  } catch (error) {
    next(error);
  }
};

const reorderExperience = async (req, res, next) => {
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

    await Experience.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Experience reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperience
};
