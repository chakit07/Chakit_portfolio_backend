const Skill = require('../models/Skill');
const SkillCategory = require('../models/SkillCategory');

// --- Skill Categories ---

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await SkillCategory.find().sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, order } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const existing = await SkillCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Skill category already exists.' });
    }

    const category = await SkillCategory.create({
      name: name.trim(),
      order: order !== undefined ? Number(order) : 0
    });

    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const category = await SkillCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) category.name = name.trim();
    if (order !== undefined) category.order = Number(order);

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const count = await Skill.countDocuments({ category: id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${count} skill(s) are associated with it. Reassign or delete those skills first.`
      });
    }

    await SkillCategory.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- Skills ---

const getAllSkills = async (req, res, next) => {
  try {
    const { category, visible } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (visible !== undefined) {
      query.visible = visible === 'true';
    }

    const skills = await Skill.find(query)
      .populate('category', 'name')
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { name, category, icon, proficiency, order, visible } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Skill name and category are required.' });
    }

    const maxOrder = await Skill.findOne({ category }).sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (maxOrder ? maxOrder.order + 1 : 0);

    const skill = await Skill.create({
      name: name.trim(),
      category,
      icon: icon || '',
      proficiency: proficiency || 'Proficient',
      order: nextOrder,
      visible: visible !== undefined ? Boolean(visible) : true
    });

    const populated = await Skill.findById(skill._id).populate('category', 'name');
    res.status(201).json({ success: true, message: 'Skill created.', data: populated });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    const fields = ['name', 'category', 'icon', 'proficiency', 'order', 'visible'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        skill[field] = req.body[field];
      }
    });

    await skill.save();
    const populated = await Skill.findById(skill._id).populate('category', 'name');
    res.status(200).json({ success: true, message: 'Skill updated.', data: populated });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }
    res.status(200).json({ success: true, message: 'Skill deleted.' });
  } catch (error) {
    next(error);
  }
};

const reorderSkills = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required for reordering.' });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: Number(item.order) } }
      }
    }));

    await Skill.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'Skills reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills
};
