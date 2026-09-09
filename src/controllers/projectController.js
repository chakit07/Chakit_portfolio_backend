const Project = require('../models/Project');
const ProjectCategory = require('../models/ProjectCategory');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// --- Project Categories ---

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await ProjectCategory.find().sort({ order: 1, name: 1 });
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

    const slug = generateSlug(name);
    const existing = await ProjectCategory.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this name or slug already exists.' });
    }

    const category = await ProjectCategory.create({
      name: name.trim(),
      slug,
      order: order !== undefined ? Number(order) : 0
    });

    res.status(201).json({ success: true, message: 'Category created successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const category = await ProjectCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) {
      category.name = name.trim();
      category.slug = generateSlug(name);
    }
    if (order !== undefined) {
      category.order = Number(order);
    }

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any projects are linked to this category
    const count = await Project.countDocuments({ category: id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: it is currently referenced by ${count} project(s). Reassign or delete those projects first.`
      });
    }

    await ProjectCategory.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// --- Projects ---

const getAllProjects = async (req, res, next) => {
  try {
    const { status, category, search, page, limit } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = { order: 1, createdAt: -1 };

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const total = await Project.countDocuments(query);
      const projects = await Project.find(query)
        .populate('category', 'name slug')
        .sort(sortOrder)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        data: projects,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    }

    const projects = await Project.find(query)
      .populate('category', 'name slug')
      .sort(sortOrder);

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('category', 'name slug');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      summary,
      description,
      thumbnail,
      gallery,
      techStack,
      category,
      liveUrl,
      repoUrl,
      featured,
      status,
      order,
      features,
      challenges,
      solutions
    } = req.body;

    if (!title || !summary || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, summary, and category are required.'
      });
    }

    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);
    // Ensure slug uniqueness
    const slugExists = await Project.findOne({ slug: finalSlug });
    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const maxOrderProject = await Project.findOne().sort({ order: -1 });
    const nextOrder = order !== undefined ? Number(order) : (maxOrderProject ? maxOrderProject.order + 1 : 0);

    const project = await Project.create({
      title: title.trim(),
      slug: finalSlug,
      summary: summary.trim(),
      description: description || '',
      thumbnail: thumbnail || '',
      gallery: Array.isArray(gallery) ? gallery : [],
      techStack: Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []),
      category,
      liveUrl: liveUrl || '',
      repoUrl: repoUrl || '',
      featured: Boolean(featured),
      status: status === 'published' ? 'published' : 'draft',
      order: nextOrder,
      features: Array.isArray(features) ? features : [],
      challenges: Array.isArray(challenges) ? challenges : [],
      solutions: Array.isArray(solutions) ? solutions : []
    });

    const populated = await Project.findById(project._id).populate('category', 'name slug');
    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const fields = [
      'title', 'summary', 'description', 'thumbnail', 'gallery',
      'techStack', 'category', 'liveUrl', 'repoUrl', 'featured',
      'status', 'order', 'features', 'challenges', 'solutions'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'techStack' && typeof req.body[field] === 'string') {
          project[field] = req.body[field].split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          project[field] = req.body[field];
        }
      }
    });

    if (req.body.slug && req.body.slug !== project.slug) {
      const slugCandidate = generateSlug(req.body.slug);
      const slugExists = await Project.findOne({ slug: slugCandidate, _id: { $ne: id } });
      if (slugExists) {
        return res.status(409).json({ success: false, message: 'A project with this slug already exists.' });
      }
      project.slug = slugCandidate;
    }

    await project.save();
    const populated = await Project.findById(project._id).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const reorderProjects = async (req, res, next) => {
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

    await Project.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: 'Projects reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
