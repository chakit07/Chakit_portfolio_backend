const SocialLink = require('../models/SocialLink');

const getAllSocialLinks = async (req, res, next) => {
  try {
    const { visible } = req.query;
    const query = {};
    if (visible !== undefined) {
      query.visible = visible === 'true';
    }
    const links = await SocialLink.find(query).sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, data: links });
  } catch (error) {
    next(error);
  }
};

const createSocialLink = async (req, res, next) => {
  try {
    const { platform, label, url, icon, order, visible } = req.body;

    if (!platform || !url) {
      return res.status(400).json({ success: false, message: 'Platform and URL are required.' });
    }

    const maxOrder = await SocialLink.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 0);

    const link = await SocialLink.create({
      platform: platform.trim(),
      label: label || platform.trim(),
      url: url.trim(),
      icon: icon || '',
      order: nextOrder,
      visible: visible !== undefined ? Boolean(visible) : true
    });

    res.status(201).json({ success: true, message: 'Social link created.', data: link });
  } catch (error) {
    next(error);
  }
};

const updateSocialLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const link = await SocialLink.findById(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Social link not found.' });
    }

    const fields = ['platform', 'label', 'url', 'icon', 'order', 'visible'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        link[field] = req.body[field];
      }
    });

    await link.save();
    res.status(200).json({ success: true, message: 'Social link updated.', data: link });
  } catch (error) {
    next(error);
  }
};

const deleteSocialLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const link = await SocialLink.findByIdAndDelete(id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Social link not found.' });
    }
    res.status(200).json({ success: true, message: 'Social link deleted.' });
  } catch (error) {
    next(error);
  }
};

const reorderSocialLinks = async (req, res, next) => {
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

    await SocialLink.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Social links reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks
};
